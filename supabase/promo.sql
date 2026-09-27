-- ============================================================================
-- La Bonne Quittance — campagnes promo affichées sur le dashboard
-- (première campagne : popup LMNP Simple, jusqu'au 31/12/2026)
-- À exécuter UNE FOIS dans Supabase > SQL Editor.
-- Réexécutable sans risque (IF NOT EXISTS / DROP POLICY IF EXISTS / ON CONFLICT).
--
-- Tant que ce script n'est pas exécuté, la popup ne s'affiche simplement pas.
-- ============================================================================

-- 1. Campagnes ─────────────────────────────────────────────────────────────────
-- Une ligne par campagne. L'affichage est piloté par `active` et la fenêtre
-- [starts_at, ends_at[ ; le ciblage (bien meublé, quittance déjà générée) est
-- dans src/lib/promo.ts.
create table if not exists public.promo_campaigns (
  id         text primary key,
  active     boolean not null default true,
  starts_at  timestamptz not null default now(),
  ends_at    timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.promo_campaigns enable row level security;

drop policy if exists "promo_campaigns_select" on public.promo_campaigns;
create policy "promo_campaigns_select" on public.promo_campaigns
  for select to authenticated
  using (true);
-- Pas de policy d'écriture : les campagnes se gèrent depuis le SQL Editor.

-- 2. Vues par utilisateur ──────────────────────────────────────────────────────
-- Une ligne = la popup a été affichée une fois à cet utilisateur (elle ne
-- revient plus). Les colonnes suivantes tracent ce qu'il en a fait.
create table if not exists public.promo_campaign_views (
  campaign_id         text not null references public.promo_campaigns (id) on delete cascade,
  user_id             uuid not null references auth.users (id) on delete cascade,
  shown_at            timestamptz not null default now(),
  closed_at           timestamptz null,
  discover_clicked_at timestamptz null,
  notify_optin_at     timestamptz null, -- « Me prévenir en janvier »
  primary key (campaign_id, user_id)
);
create index if not exists promo_campaign_views_user_idx on public.promo_campaign_views (user_id);
alter table public.promo_campaign_views enable row level security;

drop policy if exists "promo_views_select_own" on public.promo_campaign_views;
create policy "promo_views_select_own" on public.promo_campaign_views
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "promo_views_insert_own" on public.promo_campaign_views;
create policy "promo_views_insert_own" on public.promo_campaign_views
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "promo_views_update_own" on public.promo_campaign_views;
create policy "promo_views_update_own" on public.promo_campaign_views
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 3. Campagne LMNP Simple ──────────────────────────────────────────────────────
insert into public.promo_campaigns (id, active, starts_at, ends_at)
values ('lmnp_simple_2026', true, now(), '2026-12-31 23:59:59 Europe/Paris')
on conflict (id) do nothing;

-- ============================================================================
-- Mémo
--
-- Couper la campagne tout de suite :
--   update public.promo_campaigns set active = false where id = 'lmnp_simple_2026';
--
-- La réactiver / prolonger :
--   update public.promo_campaigns
--   set active = true, ends_at = '2027-03-31 23:59:59 Europe/Paris'
--   where id = 'lmnp_simple_2026';
--   (ne s'affiche qu'à ceux qui ne l'ont jamais vue ; pour tout le monde,
--   créer plutôt une nouvelle campagne : nouvel id ici + dans src/lib/promo-config.ts)
--
-- Liste « Me prévenir en janvier » (pour l'envoi de janvier) :
--   select u.email, v.notify_optin_at
--   from public.promo_campaign_views v
--   join auth.users u on u.id = v.user_id
--   where v.campaign_id = 'lmnp_simple_2026' and v.notify_optin_at is not null
--   order by v.notify_optin_at;
-- ============================================================================
