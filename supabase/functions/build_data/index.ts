// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "@supabase/supabase-js"

console.log("Building data...")

Deno.serve(async (req) => {
  try {
    // connect to supabase
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
            global: {
                headers: { Authorization: req.headers.get('Authorization')! }
            },
            auth: {
                persistSession: false
            }
        }
    );

    // insert data
    const { error } = await supabase.from('jf-test').insert({ test: 'test' });
    if (error)
        throw error

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
