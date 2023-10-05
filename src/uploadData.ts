import { createClient } from "@supabase/supabase-js";
import json from "../outputs/output.json" assert { type: 'json' };
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    // insert new data
    const { cases, interests, profiles } = json;

    const insertTo = async (table, data) => {
        const { error } = await supabase.from(table).insert(data);
        if (error)
            throw new Error(`Error inserting data to ${table}: ${error.message}`);
    }

    await insertTo("cases", cases);
    await insertTo("interests", interests);
    await insertTo("profiles", profiles);

    console.log("Successfully inserted new data.");
}

main();
