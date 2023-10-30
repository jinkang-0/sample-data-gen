import { v4 } from "https://deno.land/std@0.91.0/uuid/mod.ts";
import { pickFrom, randBool, randInt, randomCountry, randomDateFromNow, randomExperience, randomGibberish, randomIsoCode, randomIsoList, randomLocation, randomNumString, randomParagraph, randomRoleEnum } from "./tools.ts";
import { CaseListing, LimitedAssistance, TranslationRequest, Profile, Interest, UserData, ListingTypeEnum, RoleEnum, UUID, CaseLanguage, Relief, ProfileLanguage, Role } from "./schema.ts";

const randomUUID = v4.generate;

// export builders
export function buildCases(numCases: number): { cases: CaseListing[], languages: CaseLanguage[], reliefs: Relief[] } {
    const cases: CaseListing[] = [];
    const languages: CaseLanguage[] = [];
    const reliefs: Relief[] = [];
    const caseLegalServerIds = new Set<number>();
    
    for (let i = 0; i < numCases; i++) {
        const c = randomCaseListing(caseLegalServerIds);
        cases.push(c);

        const numLangs = randInt(1, 3);
        for (let j = 0; j < numLangs; j++) {
            languages.push(randomCaseLanguage(c.id));
        }

        const numReliefs = randInt(1, 4);
        for (let j = 0; j < numReliefs; j++) {
            reliefs.push(randomRelief(c.id));
        }
    }

    return { cases, languages, reliefs };
}

export function buildLimitedAssistances(numLimitedAssistances: number): LimitedAssistance[] {
    const limitedAssistances: LimitedAssistance[] = [];

    for (let i = 0; i < numLimitedAssistances; i++) {
        limitedAssistances.push(randomLimitedAssistance());
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

export function buildProfiles(usersData: UserData[]): { profiles: Profile[], languages: ProfileLanguage[], roles: Role[] } {
    const profiles: Profile[] = [];
    const languages: ProfileLanguage[] = [];
    const roles: Role[] = [];

    for (const user of usersData) {
        const p = randomProfile(user);
        profiles.push(p);

        const numLangs = randInt(1, 3);
        for (let j = 0; j < numLangs; j++) {
            languages.push(randomProfileLanguage(p.user_id));
        }

        const numRoles = randBool(0.7) ? 1 : 2;
        for (let j = 0; j < numRoles; j++) {
            roles.push(randomProfileRole(p.user_id));
        }
    }

    return { profiles, languages, roles };
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
    if (profiles.length === 0)
        return [];

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
    const typeOptions: ListingTypeEnum[] = [];

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




// helper functions for join table rows
function randomCaseLanguage(case_id: UUID): CaseLanguage {
    return { listing_id: case_id, iso_code: randomIsoCode() };
}

function randomRelief(case_id: UUID): Relief {
    return { listing_id: case_id, relief_code: randomGibberish() };
}

function randomProfileLanguage(user_id: UUID): ProfileLanguage {
    return { user_id, iso_code: randomIsoCode(), can_read: randBool(), can_write: randBool() }
}

function randomProfileRole(user_id: UUID): Role {
    return { user_id, role: randomRoleEnum() };
}



// helper functions for table rows
function randomCaseListing(legalServerSet: Set<number>): CaseListing {
    const randSummaryLength = randInt(40, 60);

    let legalServerId = randomNumString(3);
    while (legalServerSet.has(legalServerId)) {
        legalServerId = randomNumString(3);
    }
    legalServerSet.add(legalServerId);

    const c: CaseListing = {
        id: randomUUID() as UUID,
        legal_server_id: legalServerId,
        country: randomCountry(),
        upcoming_date: randomDateFromNow(30, 180),
        is_remote: randBool(),
        client_location: randomLocation(),
        summary: randomParagraph(randSummaryLength),
        needs_interpreter: randBool(),
        hours_per_month: randInt(20, 200),
        title: randomParagraph(randInt(2, 8)),
        num_months: randInt(1, 5),
        in_court: randBool(),
        needs_attorney: randBool(),
    };

    return c;
}

function randomLimitedAssistance(): LimitedAssistance {
    const r: LimitedAssistance = {
        id: randomUUID() as UUID,
        summary: randomParagraph(randInt(5, 30)),
        languages: randomIsoList(),
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
        id: randomUUID() as UUID,
        languages: randomIsoList(),
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
        hours_per_month: randInt(40, 240),
        immigration_law_experience: randomExperience(),
        bar_number: randomNumString(6).toString(),
        start_date: randomDateFromNow(5, 14),
        availability_description: randomParagraph(randInt(0, 30)),
        eoir_registered: randBool(),
        location: randomLocation()
    };

    return u;
}

function randomInterest(listing: CaseListing | LimitedAssistance | TranslationRequest, listingType: ListingTypeEnum, profile: Profile): Interest {

    const roles: RoleEnum[] = (listingType === 'Case')
        ? pickFrom(["Attorney", "Interpreter"])
        : (listingType === "Limited Assistance")
            ? ["Research Fellow"]
            : ["Translator"];

    const it: Interest = {
        listing_id: listing.id,
        user_id: profile.user_id,
        listing_type: listingType,
        form_response: {
            interestReason: randomParagraph(randInt(40, 60)),
            rolesInterested: roles,
            start_date: randomDateFromNow(0, 30)
        }
    }

    return it;
}

