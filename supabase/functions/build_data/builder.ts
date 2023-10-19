import { v4 } from "https://deno.land/std@0.91.0/uuid/mod.ts";
import { pickFrom, pickSomeFrom, randBool, randInt, randomAccreditations, randomCountry, randomDateFromNow, randomExperience, randomFirstName, randomInitials, randomLanguageList, randomLastName, randomLocation, randomNumString, randomParagraph, randomProgram, randomRoles } from "./tools.ts";
import { CaseListing, LimitedAssistance, TranslationRequest, Profile, Interest } from "./schema.ts";

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

export function buildProfiles(numProfiles: number): Profile[] {
    const profiles: Profile[] = [];

    for (let i = 0; i < numProfiles; i++) {
        profiles.push(randomProfile());
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
        typeOptions.push("Case");
    }
    if (types.limitedAssistances) {
        listingOptions.push(listings.limitedAssistances);
        typeOptions.push("Limited Assistance");
    }
    if (types.translationRequests) {
        listingOptions.push(listings.translationRequests);
        typeOptions.push("Translation Request");
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
        client_initials: randomInitials(),
        country: randomCountry(),
        time_to_complete: randomDateFromNow(30, 180),
        is_remote: randBool(),
        languages: randomLanguageList(),
        client_location: randomLocation(),
        summary: randomParagraph(randSummaryLength),
        program: randomProgram(),
        upcoming_hearing_date: randomDateFromNow(30, 60),
        needs_interpreter: randBool(),
        interest_ids: []
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

function randomProfile(): Profile {
    const u: Profile = {
        user_id: randomUUID(),
        first_name: randomFirstName(),
        last_name: randomLastName(),
        roles: randomRoles(),
        languages: randomLanguageList(),
        accreditations: randomAccreditations(),
        hours_per_week: randInt(7, 16),
        immigration_law_experience: randomExperience(),
        bar_number: randomNumString(6),
        start_date: randomDateFromNow(5, 14),
        interest_ids: []
    };

    return u;
}

function randomInterest(listing: CaseListing | LimitedAssistance | TranslationRequest, listingType: string, profile: Profile): Interest {

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

    listing.interest_ids.push(it.id);
    profile.interest_ids.push(it.id);

    return it;
}

