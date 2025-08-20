// lib/auth.ts
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   redirect("/login"); // 🚪 not logged in, send to login
  // }

  // Fetch the user's profile from the "profiles" table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .single();

  if (!error && (profile?.full_name === null || profile?.full_name === undefined)) {
    redirect(`/${user?.id}/profile`);
  }

  return user; // ✅ pass the user object
}
