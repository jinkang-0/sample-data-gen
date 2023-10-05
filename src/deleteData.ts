import { exit } from "process";
import { createInterface } from "readline";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
dotenv.config();

// safety prompt
const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question("THIS WILL PURGE EVERYTHING IN THE DATABASE, ARE YOU SURE YOU WANT TO CONTINUE? (y/n): ", (ans) => {
    if (ans !== 'y') {
        exit();
    }

    main();
});


async function main() {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    // purge original data
    const nullUUID = randomUUID();
    const deleteFrom = async (table: string, pickColumn: string) => {
        const { error } = await supabase.from(table).delete().neq(pickColumn, nullUUID);
        if (error)
            throw new Error(`Error deleting ${table}: ${error.message}`);
    }

    await deleteFrom("cases", "id");
    await deleteFrom("interests", "id");
    await deleteFrom("profiles", "user_id");
    // await deleteFrom("limitedAssistances");
    // await deleteFrom("translationRequests");

    console.log("Successfully purged all data.");

    readline.close();
}

