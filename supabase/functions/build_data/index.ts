// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "@supabase/supabase-js";
import { buildCases, buildInterests, buildProfiles } from "./builder.ts";
import {
    CaseListing,
    Profile,
    Interest,
    CaseLanguage,
    Relief,
    ProfileLanguage,
    Role
} from "./schema.ts";

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
        const NUM_INTERESTS =
            (body.numInterests && parseInt(body.numInterests)) || 6000;

        if (NUM_CASES < 0 || NUM_INTERESTS < 0)
            throw new Error("numCases or numInterests cannot be negative!");

        if (NUM_CASES > 1000) throw new Error("numCases cannot exceed 1000!");

        // get users
        const { data: usersData, error: readUsersError } = await supabase
            .from("test_users")
            .select();
        if (readUsersError) throw readUsersError;

        if (NUM_INTERESTS > usersData.length * NUM_CASES)
            throw new Error("numInterests cannot exceed numUsers x numCases!");

        // build data
        const {
            cases,
            languages: caseLanguages,
            reliefs
        } = buildCases(NUM_CASES);

        const {
            profiles,
            languages: profileLanguages,
            roles
        } = buildProfiles(usersData);

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
            data:
                | CaseListing[]
                | Profile[]
                | Interest[]
                | CaseLanguage[]
                | Relief[]
                | ProfileLanguage[]
                | Role[]
        ) => {
            const { error } = await supabase.from(table).insert(data);
            if (error) throw error;
        };

        if (NUM_CASES > 0) {
            await insertTo("cases", cases);
            await Promise.all([
                insertTo("cases-languages", caseLanguages),
                insertTo("cases-reliefs", reliefs)
            ]);
            console.log("CASES-RELATED TABLES SET!");
        }

        if (usersData.length > 0) {
            await insertTo("profiles", profiles);
            await Promise.all([
                insertTo("profiles-languages", profileLanguages),
                insertTo("profiles-roles", roles)
            ]);
            console.log("PROFILES-RELATED TABLES SET!");
        }

        if (NUM_INTERESTS > 0) {
            await insertTo("interests", interests);
            console.log("INTEREST-RELATED TABLES SET!");
        }

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
