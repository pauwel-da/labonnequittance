import base64
import json
import os
import re
import tempfile
from datetime import datetime
from io import BytesIO

from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (
    BooleanObject,
    NameObject,
    NumberObject,
    create_string_object,
)
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas as rl_canvas

_FF_READ_ONLY = 1
_FF_MULTILINE = 4096       # bit 13
_FF_RICH_TEXT = 33554432   # bit 26


# ── Field filling helpers ─────────────────────────────────────────────────────

def _iter_acroform_fields(writer):
    """Yield every field object from the AcroForm hierarchy."""
    acroform = writer._root_object.get("/AcroForm")
    if acroform is None:
        return
    stack = list(acroform.get_object().get("/Fields", []))
    while stack:
        ref = stack.pop()
        obj = ref.get_object()
        kids = obj.get("/Kids")
        if kids:
            if obj.get("/T"):
                yield obj
            stack.extend(kids)
        else:
            yield obj


def _fill_fields(writer, field_values):
    """Set /V on every named Acroform field and clear cached appearances."""
    for obj in _iter_acroform_fields(writer):
        t = obj.get("/T")
        if t is None:
            continue
        name = str(t)
        if name in field_values:
            obj.update({NameObject("/V"): create_string_object(field_values[name])})
            if "/AP" in obj:
                del obj["/AP"]
            for kid_ref in obj.get("/Kids", []):
                kid = kid_ref.get_object()
                if "/AP" in kid:
                    del kid["/AP"]


def _reduce_font_size(writer, field_names, reduction=2):
    """Reduce the /DA font size for specific fields."""
    acroform = writer._root_object.get("/AcroForm")
    form_da = ""
    if acroform:
        da_obj = acroform.get_object().get("/DA")
        if da_obj:
            form_da = str(da_obj)

    for obj in _iter_acroform_fields(writer):
        t = obj.get("/T")
        if t is None or str(t) not in field_names:
            continue
        da_obj = obj.get("/DA")
        da_str = str(da_obj) if da_obj else form_da
        if not da_str:
            continue

        def replace_size(m):
            new_size = max(4, float(m.group(1)) - reduction)
            return m.group(0).replace(m.group(1), f"{new_size:g}")

        new_da = re.sub(r"(\d+(?:\.\d+)?)\s+Tf", replace_size, da_str)
        obj.update({NameObject("/DA"): create_string_object(new_da)})


def _xml_escape(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def _set_multiline(writer, field_names):
    """Enable the Multiline flag on specified fields."""
    for obj in _iter_acroform_fields(writer):
        t = obj.get("/T")
        if t is None or str(t) not in field_names:
            continue
        ff = int(obj.get("/Ff", 0))
        obj.update({NameObject("/Ff"): NumberObject(ff | _FF_MULTILINE)})


def _set_rich_text(writer, field_name, plain_value, segments):
    """Set /V (plain) and /RV (rich text) on a field.

    segments: list of (text, bold) tuples that make up the paragraph.
    """
    spans = "".join(
        f'<span style="font-weight:bold">{_xml_escape(t)}</span>' if bold
        else f'<span>{_xml_escape(t)}</span>'
        for t, bold in segments
    )
    rv = (
        '<?xml version="1.0"?>'
        '<body xmlns="http://www.w3.org/1999/xhtml" '
        'xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/" '
        'xfa:APIVersion="Acrobat:1.0.0" xfa:spec="2.0.2">'
        f'<p dir="ltr">{spans}</p>'
        '</body>'
    )
    for obj in _iter_acroform_fields(writer):
        t = obj.get("/T")
        if t is None or str(t) != field_name:
            continue
        ff = int(obj.get("/Ff", 0))
        obj.update({
            NameObject("/Ff"):  NumberObject(ff | _FF_RICH_TEXT),
            NameObject("/V"):   create_string_object(plain_value),
            NameObject("/RV"):  create_string_object(rv),
        })
        if "/AP" in obj:
            del obj["/AP"]


def _lock_all_fields(writer):
    """Mark every Acroform field as ReadOnly."""
    for obj in _iter_acroform_fields(writer):
        ff = int(obj.get("/Ff", 0))
        obj.update({NameObject("/Ff"): NumberObject(ff | _FF_READ_ONLY)})
        for kid_ref in obj.get("/Kids", []):
            kid = kid_ref.get_object()
            ff_kid = int(kid.get("/Ff", 0))
            kid.update({NameObject("/Ff"): NumberObject(ff_kid | _FF_READ_ONLY)})


# ── Signature image overlay ───────────────────────────────────────────────────

def _get_signature_rect(template_path):
    """Return the /Rect of the signature widget annotation."""
    reader = PdfReader(template_path)
    for page in reader.pages:
        raw = page.get("/Annots")
        if raw is None:
            continue
        annots = raw.get_object() if hasattr(raw, "get_object") else raw
        for annot in annots:
            obj = annot.get_object()
            if str(obj.get("/T", "")) == "signature":
                return [float(v) for v in obj["/Rect"]]
    return None


def _build_signature_overlay(sig_b64, rect, page_w, page_h):
    """Create a single-page PDF containing only the signature image at rect."""
    raw = sig_b64.split(",")[1] if "," in sig_b64 else sig_b64
    img_bytes = base64.b64decode(raw)

    img = Image.open(BytesIO(img_bytes)).convert("RGBA")
    # Composite onto white so transparent areas become white
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    flat = Image.alpha_composite(bg, img).convert("RGB")

    img_buf = BytesIO()
    flat.save(img_buf, format="PNG")
    img_buf.seek(0)

    x1, y1, x2, y2 = rect
    w, h = x2 - x1, y2 - y1

    buf = BytesIO()
    c = rl_canvas.Canvas(buf, pagesize=(page_w, page_h))
    c.drawImage(ImageReader(img_buf), x1, y1, width=w, height=h,
                preserveAspectRatio=True, anchor="sw")
    c.save()
    buf.seek(0)
    return buf


# ── Lambda entry point ────────────────────────────────────────────────────────

def lambda_handler(event, context):
    http_method = (
        event.get("httpMethod")
        or event.get("requestContext", {}).get("http", {}).get("method", "POST")
    )
    if http_method == "OPTIONS":
        return {"statusCode": 200, "body": ""}

    raw_body = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raw_body = base64.b64decode(raw_body).decode("utf-8")

    try:
        body = json.loads(raw_body)
    except Exception:
        return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON"})}

    loyer = float(body.get("montant_loyer_hors_charges_raw", 0))
    charges = float(body.get("montant_charges_raw", 0))
    total = loyer + charges

    def fmt(n):
        return f"{n:,.2f}".replace(",", " ").replace(".", ",")

    proprietaire_nom  = body.get("proprietaire_prenom_nom", "")
    locataire_nom     = body.get("locataire_prenom_nom", "")
    ville             = body.get("fait_a", "")
    date_debut        = body.get("date_debut_periode_paiement", "")
    date_fin          = body.get("date_fin_periode_paiement", "")
    date_paiement_str = body.get("date_paiement", "")
    fait_le           = datetime.now().strftime("%d/%m/%Y")

    fields = {
        # ── Identité ──────────────────────────────────────────────────────────
        "proprietaire_prenom_nom":             proprietaire_nom,
        "proprietaire_rue":                    body.get("proprietaire_rue", ""),
        "proprietaire_code_postal_ville_pays": body.get("proprietaire_code_postal_ville_pays", ""),
        "locataire_prenom_nom":                locataire_nom,
        "locataire_rue":                       body.get("locataire_rue", ""),
        "locataire_code_postal_ville":         body.get("locataire_code_postal_ville", ""),
        "locataire_rue_code_postal_ville":     body.get("locataire_rue_code_postal_ville", ""),
        # ── Montants ──────────────────────────────────────────────────────────
        "montant_loyer_hors_charges":          fmt(loyer),
        "montant_charges":                     fmt(charges),
        "montant_total_paye":                  fmt(total),
        # ── Dates (v1) ────────────────────────────────────────────────────────
        "date_debut_periode_paiement":         date_debut,
        "date_fin_periode_paiement":           date_fin,
        "date_paiement":                       date_paiement_str,
        "fait_a":                              ville,
        "fait_le":                             fait_le,
        # ── Champs v2 ─────────────────────────────────────────────────────────
        "fait_le_a": (
            f"Fait le {fait_le}, à {ville}"
        ),
        "texte_global": (
            f"Je soussigné {proprietaire_nom} propriétaire du logement désigné "
            f"ci-dessus, déclare avoir reçu de {locataire_nom}, la somme de {fmt(total)} "
            f"euros, au titre du paiement du loyer et des charges pour la période de location "
            f"du {date_debut} au {date_fin} et lui en donne quittance, sous réserve de tous mes droits."
        ),
        "texte_loi": (
            "Cette quittance annule tous les reçus qui auraient pu être établis "
            "précédemment en cas de paiement partiel du montant du présent terme.\n"
            "Elle est à conserver pendant trois ans par le locataire "
            "(loi n° 89-462 du 6 juillet 1989 : art. 7-1)."
        ),
        # ── Signature ─────────────────────────────────────────────────────────
        "signature":                           "",
    }

    template_path = os.path.join(os.path.dirname(__file__), "modele_v2.pdf")
    if os.path.exists(template_path):
        # v2 : date_paiement contient la phrase complète
        fields["date_paiement"] = f"Date du paiement le : {date_paiement_str}"
    else:
        template_path = os.path.join(os.path.dirname(__file__), "modele.pdf")
        # v1 : date_paiement est la date brute (déjà définie ci-dessus)

    reader = PdfReader(template_path)
    writer = PdfWriter()
    writer.clone_reader_document_root(reader)

    _fill_fields(writer, fields)
    _reduce_font_size(writer, {"date_debut_periode_paiement", "date_fin_periode_paiement"}, reduction=2)
    _set_multiline(writer, {"texte_loi"})
    _set_rich_text(writer, "texte_global", fields["texte_global"], [
        (
            f"Je soussigné {proprietaire_nom} propriétaire du logement désigné "
            f"ci-dessus, déclare avoir reçu de {locataire_nom}, la somme de {fmt(total)} "
            f"euros, au titre du paiement du loyer et des charges pour la période de location du ",
            False,
        ),
        (date_debut, True),
        (" au ", False),
        (date_fin, True),
        (" et lui en donne quittance, sous réserve de tous mes droits.", False),
    ])
    _lock_all_fields(writer)

    if writer._root_object.get("/AcroForm"):
        writer._root_object["/AcroForm"].update({
            NameObject("/NeedAppearances"): BooleanObject(True),
        })

    # Overlay drawn signature image if provided
    sig_image = body.get("signature_image", "")
    if sig_image:
        page = writer.pages[0]
        page_w = float(page.mediabox.width)
        page_h = float(page.mediabox.height)
        rect = _get_signature_rect(template_path)
        if rect:
            overlay_buf = _build_signature_overlay(sig_image, rect, page_w, page_h)
            overlay_reader = PdfReader(overlay_buf)
            page.merge_page(overlay_reader.pages[0])

    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(tmp_fd)
    try:
        with open(tmp_path, "wb") as f:
            writer.write(f)
        with open(tmp_path, "rb") as f:
            pdf_bytes = f.read()
    finally:
        os.unlink(tmp_path)

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="quittance.pdf"',
        },
        "body": base64.b64encode(pdf_bytes).decode("utf-8"),
        "isBase64Encoded": True,
    }
