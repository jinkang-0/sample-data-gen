import { pickFrom, randInt, randomFirstName, randomLastName } from "../build_data/tools.ts";
import json from "../sampleData.json" assert { type: "json" };
const { extensions, guilds } = json;

// randomizers
function randomEmail(firstName: string, lastName: string): string {
    const ffirstName = firstName.replace(/\W+/g, '').toLowerCase();
    const flastName = lastName.replace(/\W+/g, '').toLowerCase();
    const company = pickFrom(guilds);
    const ext = pickFrom(extensions);
    const type = randInt(0, 3);

    if (type === 0)
        return `${ffirstName}.${flastName}@${company}.${ext}`;
    else if (type === 1)
        return `${ffirstName[0]}${flastName}@${company}.${ext}`;
    
    return `${ffirstName}@${company}.${ext}`;
}

export function randomUserData(): {firstName: string, lastName:string, email: string} {
    const firstName = randomFirstName();
    const lastName = randomLastName();
    const email = randomEmail(firstName, lastName);
    return {firstName, lastName, email};
}
