import { v4 } from "https://deno.land/std@0.91.0/uuid/mod.ts";
import { pickFrom, pickSomeFrom, randBool, randInt, randomCountry, randomLanguageOptions, randomDateFromNow, randomExperience, randomLanguageList, randomLocation, randomNumString, randomParagraph, randomRoles } from "./tools.ts";
import { CaseListing, LimitedAssistance, TranslationRequest, Profile, Interest, UserData } from "./schema.ts";

const randomUUID = v4.generate;

// export builders
export function buildCases(numCases: number): CaseListing[] {
    const cases: CaseListing[] = [];
    const caseLegalServerIds = new Set<number>();    
    
    for (let i = 0; i < numCases; i++) {
        cases.push(randomCaseListing(caseLegalServerIds));
    }

    return cases;
}

export function buildLimitedAssistances(numLimitedAssistances: number, cases: CaseListing[]): LimitedAssistance[] {
    const limitedAssistances: LimitedAssistance[] = [];

    for (let i = 0; i < numLimitedAssistances; i++) {
        const c = pickFrom(cases);
        limitedAssistances.push(randomLimitedAssistance(c));
    }

    return limitedAssistances
}

export function buildTranslationRequests(numTranslationRequests: number): TranslationRequest[] {
    const translationRequests: TranslationRequest[] = [];
    
    for (let i = 0; i < numTranslationRequests; i++) {
        translationRequests.push(randomTranslationRequest());
    }

    return translationRequests;
}

export function buildProfiles(usersData: UserData[]): Profile[] {
    const profiles: Profile[] = [];

    for (const user of usersData) {
        profiles.push(randomProfile(user));
    }

    return profiles;
}

export function buildInterests(
    numInterests: number,
    types: {
        cases: boolean,
        limitedAssistances: boolean,
        translationRequests: boolean
    },
    listings: { 
        cases?: CaseListing[], 
        limitedAssistances?: LimitedAssistance[],
        translationRequests?: TranslationRequest[]
    },
    profiles: Profile[]
): Interest[] {

    const interests: Interest[] = [];

    // check config
    if (!types.cases && !types.limitedAssistances && !types.translationRequests) {
        throw new Error("At least one listing type must be selected!");
    } else if (types.cases && !listings.cases) {
        throw new Error("Cases type is specified but cases listing array is empty!");
    } else if (types.limitedAssistances && !listings.limitedAssistances) {
        throw new Error("LimitedAssistance type is specified but limitedAssitance listing array is empty!");
    } else if (types.translationRequests && !listings.translationRequests) {
        throw new Error("TranslationRequest type is specified but translationRequest listing array is empty!");
    }

    // set config
    const listingOptions = [];
    const typeOptions = [];

    if (types.cases) {
        listingOptions.push(listings.cases);
        typeOptions.push(1);
    }
    if (types.limitedAssistances) {
        listingOptions.push(listings.limitedAssistances);
        typeOptions.push(2);
    }
    if (types.translationRequests) {
        listingOptions.push(listings.translationRequests);
        typeOptions.push(3);
    }

    const len = typeOptions.length;

    for (let i = 0; i < numInterests; i++) {
        const index = randInt(0, len);
        const listingsOp = listingOptions[index];
        const listingType = typeOptions[index];
    
        // pick user
        const user = pickFrom(profiles);
    
        interests.push(randomInterest(pickFrom(listingsOp!), listingType, user));
    }

    return interests;
}




// helper functions
function randomCaseListing(legalServerSet: Set<number>): CaseListing {
    const randSummaryLength = randInt(40, 60);

    let legalServerId = randomNumString(3);
    while (legalServerSet.has(legalServerId)) {
        legalServerId = randomNumString(3);
    }
    legalServerSet.add(legalServerId);

    const c: CaseListing = {
        id: randomUUID(),
        legal_server_id: legalServerId,
        country: randomCountry(),
        upcoming_date: randomDateFromNow(30, 180),
        is_remote: randBool(),
        languages: randomLanguageList(),
        client_location: randomLocation(),
        summary: randomParagraph(randSummaryLength),
        needs_interpreter: randBool(),
        hours_per_month: randInt(20, 200),
        title: randomParagraph(randInt(2, 8)),
        num_months: randInt(1, 5),
        in_court: randBool(),
        needs_attorney: randBool(),
        relief_sought: randomParagraph(randInt(5, 20)),
        active: randBool(0.7)
    };

    return c;
}

function randomLimitedAssistance(caseListing: CaseListing): LimitedAssistance {
    const r: LimitedAssistance = {
        id: randomUUID(),
        summary: caseListing.summary,
        languages: caseListing.languages,
        country: randomCountry(),
        experience_level: randomExperience(),
        deadline: randomDateFromNow(21, 180),
        interest_ids: []
    };

    return r;
}

function randomTranslationRequest(): TranslationRequest {
    const randSummaryLength = randInt(40, 60);

    const t: TranslationRequest = {
        id: randomUUID(),
        languages: randomLanguageList(),
        summary: randomParagraph(randSummaryLength),
        interest_ids: []
    };

    return t;
}

function randomProfile(userData: UserData): Profile {
    const u: Profile = {
        user_id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        roles: randomRoles(),
        languages: randomLanguageOptions(),
        hours_per_month: randInt(40, 240),
        immigration_law_experience: randomExperience(),
        bar_number: randomNumString(6),
        start_date: randomDateFromNow(5, 14),
        interest_ids: [],
        status: randInt(0, 3),
        availability_description: randomParagraph(randInt(0, 30)),
        eoir_registered: randBool(),
        location: randomLocation()
    };

    return u;
}

function randomInterest(listing: CaseListing | LimitedAssistance | TranslationRequest, listingType: number, profile: Profile): Interest {

    const numToPick = randInt(1, profile.roles.length);

    const it: Interest = {
        id: randomUUID(),
        listing_id: listing.id,
        listing_type: listingType,
        form_response: {
            interestReason: randomParagraph(randInt(40, 60)),
            interestType: pickSomeFrom(profile.roles, numToPick)
        },
        user_id: profile.user_id
    }

    profile.interest_ids.push(it.id);

    return it;
}

