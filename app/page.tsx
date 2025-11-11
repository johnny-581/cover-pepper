import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UnauthedGate from "./UnauthedGate";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (user) redirect("/letters");

  return <UnauthedGate />;
}
