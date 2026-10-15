-- ============================================================================
-- La Bonne Quittance — clics sur les services de la page /services
-- (Cautioneo, LMNP Simple…) : qui a cliqué, sur quoi, quand.
-- À exécuter UNE FOIS dans Supabase > SQL Editor.
-- Réexécutable sans risque (IF NOT EXISTS / DROP POLICY IF EXISTS).
--
-- Tant que ce script n'est pas exécuté, les clics ne sont simplement pas
-- enregistrés (le lien fonctionne quand même) et la carte Cautioneo de /admin
-- affiche une erreur explicite.
-- ============================================================================

create table if not exists public.service_clicks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  service_id text not null,            -- id dans src/lib/services-config.ts : cautioneo, lmnp-simple
  clicked_at timestamptz not null default now()
);
create index if not exists service_clicks_service_idx on public.service_clicks (service_id, clicked_at desc);
create index if not exists service_clicks_user_idx    on public.service_clicks (user_id);
alter table public.service_clicks enable row level security;

-- Un utilisateur connecté enregistre ses propres clics. Pas de policy de lecture :
-- seule la page /admin lit cette table (clé service, qui ignore la RLS).
drop policy if exists "service_clicks_insert_own" on public.service_clicks;
create policy "service_clicks_insert_own" on public.service_clicks
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- ── Mémo : qui a cliqué vers Cautioneo (à rapprocher des contrats signés) ─────
-- select u.email, count(*) as clics, min(c.clicked_at) as premier, max(c.clicked_at) as dernier
-- from public.service_clicks c join auth.users u on u.id = c.user_id
-- where c.service_id = 'cautioneo'
-- group by u.email order by dernier desc;
