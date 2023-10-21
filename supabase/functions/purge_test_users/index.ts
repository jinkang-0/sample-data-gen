import { createClient } from "@supabase/supabase-js";
import { v4 } from "https://deno.land/std@0.91.0/uuid/mod.ts";

const randomUUID = v4.generate;

Deno.serve(async (req) => {
    try {

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: {
                        Authorization: req.headers.get("Authorization")! 
                    }
                },
                auth: {
                    persistSession: false
                }
            }
        );

        // auth is good after this
        
        // fetch all test users
        const { data: userData, error: readError } = await supabase.from("test_users").select();
        if (readError) throw readError;

        for (const user of userData) {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            if (deleteError) throw deleteError;
        }

        // delete data from test user table
        const nullUUID = randomUUID();
        const { error: deleteErr } = await supabase.from("test_users").delete().neq("id", nullUUID);
        if (deleteErr) throw deleteErr;

        console.log("Successfully purged test users!");

        return new Response(JSON.stringify({ message: "Success" }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });

    } catch (error) {
        console.error(error);

        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400
        });
    }
});
