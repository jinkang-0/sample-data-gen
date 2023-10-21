import { createClient } from "@supabase/supabase-js";
import { randomUserData } from "./tools.ts";

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

        // get params
        const body = await req.json();
        const NUM_USERS = (body.numUsers && parseInt(body.numUsers)) || 100;

        if (NUM_USERS <= 0)
            throw new Error("numUsers cannot be zero or negative!");
        if (NUM_USERS > 25)
            throw new Error("Try not to insert so many users at once!");

        // generate mock data for users
        const users: {id: string, first_name: string, last_name: string, email: string}[] = [];
        for (let i = 0; i < NUM_USERS; i++) {
            const userData = randomUserData();

            const { data, error: writeUserError } = await supabase.auth.admin.createUser({
                email: userData.email,
                password: "123456789",
                user_metadata: { fake: true }
            });
            if (writeUserError) throw writeUserError;

            users.push({ id: data.user.id, first_name: userData.firstName, last_name: userData.lastName, email: userData.email });
        }

        // insert to supabase table
        const { error: writeDataError } = await supabase.from("test_users").insert(users);
        if (writeDataError) throw writeDataError;

        console.log("Successfully generated sample users!");

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
