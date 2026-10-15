-- ============================================================================
-- La Bonne Quittance — colocation : plusieurs locataires sur un même bail
-- (une seule quittance, tous les noms, un email à chacun).
-- À exécuter UNE FOIS dans Supabase > SQL Editor, AVANT de déployer le code.
-- Réexécutable sans risque (IF NOT EXISTS / DROP CONSTRAINT IF EXISTS).
--
-- Le locataire existant reste la personne principale (nom_prenom, email) ;
-- les autres personnes du bail vont dans `colocataires`. Vide par défaut :
-- aucun locataire existant ne change.
-- ============================================================================

-- Autres personnes du bail : [{"nom_prenom": "...", "email": "..."}], 5 au plus
-- (6 personnes par bail, locataire principal compris).
alter table public.locataires
  add column if not exists colocataires jsonb not null default '[]'::jsonb;

alter table public.locataires drop constraint if exists locataires_colocataires_check;
alter table public.locataires add constraint locataires_colocataires_check
  check (jsonb_typeof(colocataires) = 'array' and jsonb_array_length(colocataires) <= 5);

-- Pour un bail à deux : « couple » (un seul foyer pour la CAF) ou « colocation »
-- (foyers séparés : une attestation CAF par personne). Demandé à la première
-- attestation CAF, puis modifiable dans la fiche. Null = pas encore répondu.
alter table public.locataires
  add column if not exists foyer text;

alter table public.locataires drop constraint if exists locataires_foyer_check;
alter table public.locataires add constraint locataires_foyer_check
  check (foyer is null or foyer in ('couple', 'colocation'));
