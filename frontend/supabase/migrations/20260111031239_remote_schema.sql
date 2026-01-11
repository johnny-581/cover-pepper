drop extension if exists "pg_net";


  create table "public"."letters" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "template_id" uuid,
    "date" text not null,
    "body" text not null,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."letters" enable row level security;


  create table "public"."templates" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text,
    "latex_source" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."templates" enable row level security;

CREATE INDEX idx_letters_template ON public.letters USING btree (template_id);

CREATE INDEX idx_letters_user ON public.letters USING btree (user_id);

CREATE INDEX idx_templates_user ON public.templates USING btree (user_id);

CREATE UNIQUE INDEX letters_pkey ON public.letters USING btree (id);

CREATE UNIQUE INDEX templates_pkey ON public.templates USING btree (id);

alter table "public"."letters" add constraint "letters_pkey" PRIMARY KEY using index "letters_pkey";

alter table "public"."templates" add constraint "templates_pkey" PRIMARY KEY using index "templates_pkey";

alter table "public"."letters" add constraint "letters_template_fk" FOREIGN KEY (template_id) REFERENCES public.templates(id) ON DELETE SET NULL not valid;

alter table "public"."letters" validate constraint "letters_template_fk";

alter table "public"."letters" add constraint "letters_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."letters" validate constraint "letters_user_id_fkey";

alter table "public"."templates" add constraint "templates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."templates" validate constraint "templates_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.maybe_delete_orphan_template()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at := now();
  return new;
end;
$function$
;

grant delete on table "public"."letters" to "anon";

grant insert on table "public"."letters" to "anon";

grant references on table "public"."letters" to "anon";

grant select on table "public"."letters" to "anon";

grant trigger on table "public"."letters" to "anon";

grant truncate on table "public"."letters" to "anon";

grant update on table "public"."letters" to "anon";

grant delete on table "public"."letters" to "authenticated";

grant insert on table "public"."letters" to "authenticated";

grant references on table "public"."letters" to "authenticated";

grant select on table "public"."letters" to "authenticated";

grant trigger on table "public"."letters" to "authenticated";

grant truncate on table "public"."letters" to "authenticated";

grant update on table "public"."letters" to "authenticated";

grant delete on table "public"."letters" to "service_role";

grant insert on table "public"."letters" to "service_role";

grant references on table "public"."letters" to "service_role";

grant select on table "public"."letters" to "service_role";

grant trigger on table "public"."letters" to "service_role";

grant truncate on table "public"."letters" to "service_role";

grant update on table "public"."letters" to "service_role";

grant delete on table "public"."templates" to "anon";

grant insert on table "public"."templates" to "anon";

grant references on table "public"."templates" to "anon";

grant select on table "public"."templates" to "anon";

grant trigger on table "public"."templates" to "anon";

grant truncate on table "public"."templates" to "anon";

grant update on table "public"."templates" to "anon";

grant delete on table "public"."templates" to "authenticated";

grant insert on table "public"."templates" to "authenticated";

grant references on table "public"."templates" to "authenticated";

grant select on table "public"."templates" to "authenticated";

grant trigger on table "public"."templates" to "authenticated";

grant truncate on table "public"."templates" to "authenticated";

grant update on table "public"."templates" to "authenticated";

grant delete on table "public"."templates" to "service_role";

grant insert on table "public"."templates" to "service_role";

grant references on table "public"."templates" to "service_role";

grant select on table "public"."templates" to "service_role";

grant trigger on table "public"."templates" to "service_role";

grant truncate on table "public"."templates" to "service_role";

grant update on table "public"."templates" to "service_role";


  create policy "ltr_delete"
  on "public"."letters"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "ltr_insert"
  on "public"."letters"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "ltr_select"
  on "public"."letters"
  as permissive
  for select
  to authenticated, anon
using ((user_id = auth.uid()));



  create policy "ltr_update"
  on "public"."letters"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "tpl_delete"
  on "public"."templates"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "tpl_insert"
  on "public"."templates"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "tpl_select"
  on "public"."templates"
  as permissive
  for select
  to public
using (((user_id IS NULL) OR (user_id = auth.uid())));



  create policy "tpl_update"
  on "public"."templates"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));


CREATE TRIGGER trg_maybe_delete_orphan_template AFTER DELETE ON public.letters FOR EACH ROW EXECUTE FUNCTION public.maybe_delete_orphan_template();

CREATE TRIGGER trg_set_updated_at_letters BEFORE UPDATE ON public.letters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_set_updated_at_templates BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


