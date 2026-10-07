create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  motif text not null check (motif in ('defiscalisation','energies')),
  prenom text not null,
  nom text not null,
  adresse text not null,
  code_postal text not null,
  ville text not null,
  email text not null,
  telephone text not null,
  simulation jsonb,
  consent_at timestamptz not null,
  consent_version text not null,
  statut text not null default 'nouveau'
    check (statut in ('nouveau','appele','pas_de_reponse','rdv','perdu'))
);
create index if not exists leads_created_idx on public.leads (created_at desc);
-- RLS activée sans aucune policy : seul le serveur (clé service_role) peut lire/écrire.
alter table public.leads enable row level security;
