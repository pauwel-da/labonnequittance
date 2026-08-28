-- ============================================================================
-- La Bonne Quittance — page /admin
-- À exécuter UNE FOIS dans Supabase > SQL Editor.
--
-- Prérequis : tables biens, locataires, quittances, proprietaire, rappels,
-- trial_drafts (déjà en place). Toutes les fonctions sont SECURITY DEFINER et
-- réservées au rôle service_role (utilisé côté serveur par /admin).
-- Réexécutable sans risque (IF NOT EXISTS / OR REPLACE).
-- ============================================================================

-- 1. Journal d'événements (erreurs Lambda / Brevo, actions admin) ─────────────
create table if not exists public.admin_events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  level      text not null default 'error' check (level in ('error', 'warning', 'info')),
  source     text not null,
  message    text not null,
  user_id    uuid null,
  meta       jsonb null
);
create index if not exists admin_events_created_at_idx on public.admin_events (created_at desc);
alter table public.admin_events enable row level security;
-- Aucune policy volontairement : seule la service_role (bypass RLS) lit/écrit.

-- 2. Vue par utilisateur (funnel + fiche utilisateur) ─────────────────────────
create or replace function public.admin_users_overview()
returns table (
  user_id              uuid,
  email                text,
  created_at           timestamptz,
  last_sign_in_at      timestamptz,
  profil_complet       boolean,
  optin_marketing      boolean,
  optin_rappel_mensuel boolean,
  nb_biens             bigint,
  nb_locataires        bigint,
  nb_quittances        bigint,
  last_quittance_at    timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.email::text,
    u.created_at::timestamptz,
    u.last_sign_in_at::timestamptz,
    coalesce(
      p.nom <> '' and p.prenom <> '' and p.adresse <> '' and p.code_postal <> ''
      and p.ville <> '' and p.signature <> '',
      false
    ),
    coalesce(p.optin_marketing, false),
    coalesce(p.optin_rappel_mensuel, true),
    (select count(*) from public.biens b where b.user_id = u.id),
    (select count(*) from public.locataires l where l.user_id = u.id),
    (select count(*) from public.quittances q where q.user_id = u.id),
    (select max(q.created_at)::timestamptz from public.quittances q where q.user_id = u.id)
  from auth.users u
  left join public.proprietaire p on p.user_id = u.id
  order by u.created_at desc;
$$;

-- 3. Séries quotidiennes : inscrits et quittances par jour (heure de Paris) ────
create or replace function public.admin_daily_series(days int default 30)
returns table (day date, inscrits bigint, quittances bigint)
language sql
security definer
set search_path = public
as $$
  with d as (
    select generate_series(
      (now() at time zone 'Europe/Paris')::date - (days - 1),
      (now() at time zone 'Europe/Paris')::date,
      interval '1 day'
    )::date as day
  )
  select
    d.day,
    (select count(*) from auth.users u
      where (u.created_at at time zone 'Europe/Paris')::date = d.day),
    (select count(*) from public.quittances q
      where (q.created_at at time zone 'Europe/Paris')::date = d.day)
  from d
  order by d.day;
$$;

-- 4. Utilisateurs actifs par mois (≥ 1 quittance dans le mois) ────────────────
create or replace function public.admin_monthly_actives(months int default 6)
returns table (month date, actifs bigint, quittances bigint)
language sql
security definer
set search_path = public
as $$
  with m as (
    select generate_series(
      (date_trunc('month', now() at time zone 'Europe/Paris') - ((months - 1) * interval '1 month'))::date,
      date_trunc('month', now() at time zone 'Europe/Paris')::date,
      interval '1 month'
    )::date as month
  )
  select
    m.month,
    (select count(distinct q.user_id) from public.quittances q
      where date_trunc('month', q.created_at at time zone 'Europe/Paris')::date = m.month),
    (select count(*) from public.quittances q
      where date_trunc('month', q.created_at at time zone 'Europe/Paris')::date = m.month)
  from m
  order by m.month;
$$;

-- 5. Rappel mensuel : envois par période + conversion à 7 jours ───────────────
--    « converti » = l'utilisateur rappelé a généré une quittance dans les 7 jours.
create or replace function public.admin_rappel_stats()
returns table (periode text, envoyes bigint, convertis bigint, last_sent_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select
    r.periode::text,
    count(*),
    count(*) filter (where exists (
      select 1 from public.quittances q
      where q.user_id = r.user_id
        and q.created_at >= r.sent_at
        and q.created_at <  r.sent_at + interval '7 days'
    )),
    max(r.sent_at)::timestamptz
  from public.rappels r
  group by r.periode
  order by max(r.sent_at) desc
  limit 12;
$$;

-- 6. Droits : service_role uniquement ─────────────────────────────────────────
revoke execute on function public.admin_users_overview()      from public, anon, authenticated;
revoke execute on function public.admin_daily_series(int)     from public, anon, authenticated;
revoke execute on function public.admin_monthly_actives(int)  from public, anon, authenticated;
revoke execute on function public.admin_rappel_stats()        from public, anon, authenticated;
grant  execute on function public.admin_users_overview()      to service_role;
grant  execute on function public.admin_daily_series(int)     to service_role;
grant  execute on function public.admin_monthly_actives(int)  to service_role;
grant  execute on function public.admin_rappel_stats()        to service_role;
