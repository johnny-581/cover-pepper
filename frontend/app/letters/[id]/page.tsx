import EditorPanel from "@/components/EditorPanel";
import { createClient } from "@/lib/supabase/server";
import { Letter } from "@/lib/types";

export default async function LetterPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const id = params.id;

  const { data: letter } = await supabase
    .from("letter")
    .select("*")
    .eq("id", id);

  console.log(JSON.stringify(letter));

  if (!letter) {
    return <div>the letter cannot be found</div>;
  }

  return <EditorPanel letter={letter as unknown as Letter} />;
}

// const { data, error } = await supabase
//   .from("letters")
//   .insert([
//     {
//       user_id: "89477144-c7b9-42f6-be85-e85e146e4a3b",
//       date: "September 9, 2025",
//       body: "body",
//     },
//   ])
//   .select();
