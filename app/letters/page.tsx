import { redirect } from "next/navigation";
import EmptyState from "../EmptyState";
import { createClient } from "@/lib/supabase/server";

export default async function LettersList() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const { data: letters } = await supabase.from("letters").select("*");

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  if (!letters?.length) return <EmptyState />;

  redirect(`/letters/${letters[0].id}`);
}
