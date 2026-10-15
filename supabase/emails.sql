-- ============================================================================
-- La Bonne Quittance — emails écrits depuis /admin/emails
-- À exécuter UNE FOIS dans Supabase > SQL Editor.
-- Réexécutable sans risque (IF NOT EXISTS / OR REPLACE).
--
-- Tant que ce script n'est pas exécuté, /admin/emails affiche le pied de page
-- par défaut et refuse d'envoyer (impossible de vérifier les désinscriptions).
-- ============================================================================

-- 1. Réglages de l'admin (clé « email_footer » : pied de page des emails) ─────
create table if not exists public.admin_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid null
);
alter table public.admin_settings enable row level security;
-- Aucune policy volontairement : seule la service_role (bypass RLS) lit/écrit.

-- 2. Adresses désinscrites via le lien « Se désinscrire » des emails admin ────
create table if not exists public.email_desinscriptions (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.email_desinscriptions enable row level security;
-- Aucune policy : seule la page /desinscription (service_role) écrit.

-- 3. Adresses à ne jamais écrire : désinscrites ici, ou opt-in marketing retiré
--    (ex. désinscription d'une campagne Brevo, cf. /api/brevo/unsubscribe).
create or replace function public.admin_emails_exclus()
returns table (email text)
language sql
security definer
set search_path = public
as $$
  select d.email from public.email_desinscriptions d
  union
  select lower(u.email::text)
  from auth.users u
  join public.proprietaire p on p.user_id = u.id
  where p.optin_marketing = false and u.email is not null
  order by 1;
$$;

-- 4. Désinscription : mémorise l'adresse et retire l'opt-in marketing du compte
--    qui porte cette adresse, s'il existe.
create or replace function public.desinscrire_email(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.email_desinscriptions (email)
  values (lower(trim(p_email)))
  on conflict (email) do nothing;

  update public.proprietaire p
  set optin_marketing = false
  from auth.users u
  where u.id = p.user_id and lower(u.email) = lower(trim(p_email));
$$;

revoke execute on function public.admin_emails_exclus()   from public, anon, authenticated;
revoke execute on function public.desinscrire_email(text) from public, anon, authenticated;
grant  execute on function public.admin_emails_exclus()   to service_role;
grant  execute on function public.desinscrire_email(text) to service_role;
