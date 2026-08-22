import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest){
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if(!token){
        return NextResponse.json({error: "No authorizado"}, {status: 401});

    }
      const verifier = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
   const { data: userData, error: userError } = await verifier.auth.getUser(token);
     if (userError || !userData.user) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }
  const userId = userData.user.id;
  const admin = getSupabaseAdminClient();

  if(!admin){
    return NextResponse.json(
        {error: "Servicio no disponible"},
        {status: 500}
    );
  }

  await admin.from("subcriptions").delete().eq("user_id",userId);

  const {error: deleteError} = await admin.auth.admin.deleteUser(userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });


}
