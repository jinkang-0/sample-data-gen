// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "@supabase/supabase-js";
import { buildCases, buildInterests, buildProfiles } from "./builder.ts";
import { CaseListing, Profile, Interest } from "./schema.ts";

Deno.serve(async (req) => {
    try {
        // connect to supabase
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

        // if this point is reached without error, auth is good

        // get params
        const body = await req.json();
        const NUM_CASES = (body.numCases && parseInt(body.numCases)) || 100;
        const NUM_INTERESTS = (body.numInterests && parseInt(body.numInterests)) || 6000;
        // const NUM_PROFILES = (body.numProfiles && parseInt(body.numProfiles)) || 180;
        // num profiles now dependent on number of users in test_users table

        if (NUM_CASES < 0 || NUM_INTERESTS < 0)
            throw new Error("numCases, numProfiles, or numInterests cannot be negative!");

        // get users
        const { data: usersData, error: readUsersError } = await supabase.from("test_users").select();
        if (readUsersError) throw readUsersError;

        // build data
        const cases = buildCases(NUM_CASES);
        const profiles = buildProfiles(usersData);
        const interests = buildInterests(
            NUM_INTERESTS,
            {
                cases: true,
                limitedAssistances: false,
                translationRequests: false
            },
            { cases: cases },
            profiles
        );

        // insert data
        const insertTo = async (
            table: string,
            data: CaseListing[] | Profile[] | Interest[]
        ) => {
            const { error } = await supabase.from(table).insert(data);
            if (error) throw error;
        };

        if (NUM_CASES > 0)
            await insertTo("cases", cases);
        if (NUM_INTERESTS > 0)
            await insertTo("interests", interests);
        await insertTo("profiles", profiles);

        console.log("Successfully added data!");

        return new Response(JSON.stringify({ message: "Success" }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });

        // catch errors
    } catch (error) {
        console.error(error);

        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400
        });
    }
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
