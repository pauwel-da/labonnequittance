-- Biens
create table biens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  adresse text not null,
  code_postal text not null,
  ville text not null,
  type text not null check (type in ('studio', 'appartement')),
  created_at timestamptz default now()
);

alter table biens enable row level security;
create policy "biens: user owns rows" on biens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Locataires
create table locataires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nom text not null,
  prenom text not null,
  bien_id uuid not null references biens(id) on delete cascade,
  loyer numeric not null,
  charges numeric not null,
  date_debut date not null,
  created_at timestamptz default now()
);

alter table locataires enable row level security;
create policy "locataires: user owns rows" on locataires
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Profil propriétaire (1 ligne par utilisateur)
create table proprietaire (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  nom text not null default '',
  prenom text not null default '',
  adresse text not null default '',
  code_postal text not null default '',
  ville text not null default '',
  signature text not null default '',
  updated_at timestamptz default now()
);

alter table proprietaire enable row level security;
create policy "proprietaire: user owns row" on proprietaire
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
