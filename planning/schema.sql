CREATE TABLE Templates (
    id          uuid
    user_id     uuid    -- null if it's system template
    name        TEXT    -- can be null
    latex_source TEXT   -- not null
    created_at  timestamp
    updated_at  timestamp
)

CREATE TABLE Letters (
    id          uuid
    user_id     uuid
    template_id uuid    -- can be null
    date        TEXT    -- not null
    body        TEXT    -- not null
    metadata    jsonb   -- can be null
    created_at  timestamp
    updated_at  timestamp
)

-- example (metadata is job specific)
metadata: {
    fileTitle: "UBC Developer";
    positionTitle: "Software Developer";
    companyName: "UBC";
    companyAddress: "2329 West Mall, Vancouver, BC";
    hiringManager: "Jane Doe";
}

-- when a letter is deleted, its template should be deleted only if it is the only letter using that template and the template is not a system template.
-- when a template is deleted, letters using it are not deleted.












-- Enable needed extension (Supabase has pgcrypto; gen_random_uuid() is available)
-- create extension if not exists "pgcrypto";

-- =========================
-- Tables
-- =========================

create table if not exists templates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid,                       -- NULL => system template
  name         text,                       -- nullable
  latex_source text        not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Optional: prevent duplicate names per user (system rows can share names)
-- create unique index if not exists uq_templates_user_name
--   on templates (user_id, name) where name is not null;

create table if not exists letters (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null,       -- owned by the logged-in user
  template_id  uuid,                        -- nullable; ON DELETE SET NULL
  date         text        not null,
  body         text        not null,
  metadata     jsonb,                       -- nullable
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint letters_template_fk
    foreign key (template_id)
    references templates(id)
    on delete set null
);

-- Helpful indexes
create index if not exists idx_templates_user on templates(user_id);
create index if not exists idx_letters_user on letters(user_id);
create index if not exists idx_letters_template on letters(template_id);

-- =========================
-- updated_at trigger
-- =========================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_templates on templates;
create trigger trg_set_updated_at_templates
before update on templates
for each row execute function set_updated_at();

drop trigger if exists trg_set_updated_at_letters on letters;
create trigger trg_set_updated_at_letters
before update on letters
for each row execute function set_updated_at();

-- =========================
-- Delete rule: when a letter is deleted,
-- delete its template only if:
--   - that template is NOT a system template (user_id is not null), and
--   - no other letters reference it.
-- =========================

create or replace function maybe_delete_orphan_template()
returns trigger
language plpgsql
as $$
declare
  remaining integer;
  t_user uuid;
begin
  -- No template on the deleted letter => nothing to do
  if old.template_id is null then
    return null;
  end if;

  -- Check the template's owner (NULL means system template)
  select user_id into t_user from templates where id = old.template_id;
  if t_user is null then
    -- system template: never auto-delete
    return null;
  end if;

  -- Count remaining letters using this template
  select count(*) into remaining
  from letters
  where template_id = old.template_id;

  if remaining = 0 then
    delete from templates where id = old.template_id;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_maybe_delete_orphan_template on letters;
create trigger trg_maybe_delete_orphan_template
after delete on letters
for each row execute function maybe_delete_orphan_template();

-- =========================
-- RLS (Row Level Security)
-- =========================

-- Templates:
-- - Read: everyone can read system templates (user_id IS NULL).
--         authenticated users can read their own templates.
-- - Write (insert/update/delete): only the owning user.
alter table templates enable row level security;

-- SELECT: system templates or owned-by-user
drop policy if exists tpl_select on templates;
create policy tpl_select on templates
for select
to public
using (user_id is null or user_id = auth.uid());

-- INSERT: only as the current user
drop policy if exists tpl_insert on templates;
create policy tpl_insert on templates
for insert
to authenticated
with check (user_id = auth.uid());

-- UPDATE: only own rows
drop policy if exists tpl_update on templates;
create policy tpl_update on templates
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- DELETE: only own rows
drop policy if exists tpl_delete on templates;
create policy tpl_delete on templates
for delete
to authenticated
using (user_id = auth.uid());

-- Letters:
-- - CRUD only if user_id = auth.uid()
alter table letters enable row level security;

drop policy if exists ltr_select on letters;
create policy ltr_select on letters
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists ltr_insert on letters;
create policy ltr_insert on letters
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists ltr_update on letters;
create policy ltr_update on letters
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists ltr_delete on letters;
create policy ltr_delete on letters
for delete
to authenticated
using (user_id = auth.uid());
