// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "@supabase/supabase-js";
import { v4 } from "https://deno.land/std@0.91.0/uuid/mod.ts";
import { randomParagraph } from "../build_data/tools.ts";

const randomUUID = v4.generate;

console.log("Purging data...");

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

        // purge original data
        const randomlyGeneratedUUID = randomUUID();
        const randomlyGeneratedString = randomParagraph(10);
        const deleteFrom = async (
            table: string,
            basedOnColumn: string,
            value: unknown
        ) => {
            const { error } = await supabase
                .from(table)
                .delete()
                .neq(basedOnColumn, value);
            if (error)
                throw new Error(`Error deleting ${table}: ${error.message}`);
        };

        await deleteFrom("cases", "id", randomlyGeneratedUUID);
        await deleteFrom("interests", "listing_id", randomlyGeneratedUUID);
        await deleteFrom("profiles", "first_name", randomlyGeneratedString);

        console.log("Successfully purged data!");

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
