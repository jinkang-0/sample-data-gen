import { v4 } from "https://deno.land/std@0.91.0/uuid/mod.ts";
import {
    knuthShuffleShallow,
    pickFrom,
    pickSomeFrom,
    randBool,
    randInt,
    randomAgency,
    randomCountry,
    randomDateFromNow,
    randomExperience,
    randomIsoCodeList,
    randomIsoList,
    randomLocation,
    randomNumString,
    randomParagraph,
    randomReliefCode
} from "./tools.ts";
import {
    CaseListing,
    LimitedAssistance,
    TranslationRequest,
    Profile,
    Interest,
    UserData,
    ListingTypeEnum,
    RoleEnum,
    UUID,
    CaseLanguage,
    Relief,
    ProfileLanguage,
    Role
} from "./schema.ts";

const randomUUID = v4.generate;

// export builders
export function buildCases(numCases: number): {
    cases: CaseListing[];
    languages: CaseLanguage[];
    reliefs: Relief[];
} {
    const cases: CaseListing[] = [];
    const languages: CaseLanguage[] = [];
    const reliefs: Relief[] = [];
    const caseLegalServerIds = new Set<number>();

    for (let i = 0; i < numCases; i++) {
        const c = randomCaseListing(caseLegalServerIds);
        if (!c) break;

        cases.push(c);

        const numLangs = randInt(1, 3);
        languages.push(...randomListingLanguages(c.id, numLangs));

        const numReliefs = randInt(1, 4);
        for (let j = 0; j < numReliefs; j++) {
            reliefs.push(randomRelief(c.id));
        }
    }

    return { cases, languages, reliefs };
}

export function buildLimitedAssistances(
    numLimitedAssistances: number
): LimitedAssistance[] {
    const limitedAssistances: LimitedAssistance[] = [];

    for (let i = 0; i < numLimitedAssistances; i++) {
        limitedAssistances.push(randomLimitedAssistance());
    }

    return limitedAssistances;
}

export function buildTranslationRequests(
    numTranslationRequests: number
): TranslationRequest[] {
    const translationRequests: TranslationRequest[] = [];

    for (let i = 0; i < numTranslationRequests; i++) {
        translationRequests.push(randomTranslationRequest());
    }

    return translationRequests;
}

export function buildProfiles(usersData: UserData[]): {
    profiles: Profile[];
    languages: ProfileLanguage[];
    roles: Role[];
} {
    const profiles: Profile[] = [];
    const languages: ProfileLanguage[] = [];
    const roles: Role[] = [];

    for (const user of usersData) {
        const p = randomProfile(user);
        profiles.push(p);

        const numLangs = randInt(1, 3);
        languages.push(...randomProfileLanguages(p.user_id, numLangs));

        const numRoles = randBool(0.7) ? 1 : 2;
        roles.push(...randomProfileRole(p, numRoles));

        if (roles.find((r) => r.role === "ATTORNEY")) {
            p.bar_number = randomNumString(6).toString();
            p.eoir_registered = randBool(0.7);
            p.immigration_law_experience = randomExperience();
        }
    }

    return { profiles, languages, roles };
}

export function buildInterests(
    numInterests: number,
    types: {
        cases: boolean;
        limitedAssistances: boolean;
        translationRequests: boolean;
    },
    listings: {
        cases?: CaseListing[];
        limitedAssistances?: LimitedAssistance[];
        translationRequests?: TranslationRequest[];
    },
    profiles: Profile[]
): Interest[] {
    if (profiles.length === 0) return [];

    const interests: Interest[] = [];

    // check config
    if (
        !types.cases &&
        !types.limitedAssistances &&
        !types.translationRequests
    ) {
        throw new Error("At least one listing type must be selected!");
    } else if (types.cases && !listings.cases) {
        throw new Error(
            "Cases type is specified but cases listing array is empty!"
        );
    } else if (types.limitedAssistances && !listings.limitedAssistances) {
        throw new Error(
            "LimitedAssistance type is specified but limitedAssitance listing array is empty!"
        );
    } else if (types.translationRequests && !listings.translationRequests) {
        throw new Error(
            "TranslationRequest type is specified but translationRequest listing array is empty!"
        );
    }

    // set config
    const listingOptions = [];
    const typeOptions: ListingTypeEnum[] = [];

    if (types.cases) {
        listingOptions.push(listings.cases);
        typeOptions.push("CASE");
    }
    if (types.limitedAssistances) {
        listingOptions.push(listings.limitedAssistances);
        typeOptions.push("LIMITED_ASSISTANCE");
    }
    if (types.translationRequests) {
        listingOptions.push(listings.translationRequests);
        typeOptions.push("TRANSLATION_REQUEST");
    }

    const len = typeOptions.length;
    const idPairings: Set<`${UUID},${UUID}`> = new Set();

    for (let i = 0; i < numInterests; i++) {
        const index = randInt(0, len);
        const listingsOp = listingOptions[index];
        const listingType = typeOptions[index];
        const listing: CaseListing | LimitedAssistance | TranslationRequest =
            pickFrom(listingsOp!);

        // pick user
        const shuffledProfiles: Profile[] = knuthShuffleShallow(profiles);
        let user = shuffledProfiles[0];
        if (idPairings.has(`${listing.id},${user.user_id}`)) {
            let found = false;
            for (let j = 1; j < shuffledProfiles.length; j++) {
                user = shuffledProfiles[j];
                if (!idPairings.has(`${listing.id},${user.user_id}`)) {
                    found = true;
                    break;
                }
            }
            if (!found) continue;
        }
        idPairings.add(`${listing.id},${user.user_id}`);

        interests.push(randomInterest(listing, listingType, user));
    }

    return interests;
}

// helper functions for join table rows
function randomListingLanguages(
    listing_id: UUID,
    num_languages: number
): CaseLanguage[] {
    const languages = randomIsoCodeList(num_languages);
    return languages.map((l) => {
        return { listing_id, iso_code: l };
    });
}

function randomRelief(case_id: UUID): Relief {
    return {
        listing_id: case_id,
        relief_code: randomReliefCode().toUpperCase()
    };
}

function randomProfileLanguages(user_id: UUID, num: number): ProfileLanguage[] {
    const langs = randomIsoCodeList(num);

    return langs.map((l) => {
        return {
            user_id,
            iso_code: l,
            can_read: randBool(),
            can_write: randBool()
        };
    });
}

function randomProfileRole(profile: Profile, num_roles: number): Role[] {
    // const roles: RoleEnum[] = pickSomeFrom(
    //     ["ATTORNEY", "INTERPRETER", "LEGAL_FELLOW", "TRANSLATOR"],
    //     num_roles
    // );
    const roles: RoleEnum[] = pickSomeFrom(
        ["ATTORNEY", "INTERPRETER"],
        num_roles
    );

    return roles.map((r) => {
        return {
            user_id: profile.user_id,
            role: r
        };
    });
}

// helper functions for table rows
function randomCaseListing(legalServerSet: Set<number>): CaseListing | null {
    const randSummaryLength = randInt(40, 60);

    let legalServerId = randomNumString(3);
    for (let i = 0; i < 1000; i++) {
        if (!legalServerSet.has(legalServerId)) break;
        legalServerId = randomNumString(3);
    }
    legalServerSet.add(legalServerId);

    const c: CaseListing = {
        id: randomUUID() as UUID,
        legal_server_id: legalServerId,
        hours_per_month: randInt(20, 200),
        adjudicating_agency: randomAgency(),
        experience_needed: randomExperience()
    };

    if (randBool(0.8)) c.title = randomParagraph(randInt(2, 8));
    if (randBool(0.8)) c.summary = randomParagraph(randSummaryLength);
    if (randBool(0.8)) c.country = randomCountry();
    if (randBool(0.8)) c.client_location = randomLocation();
    if (randBool(0.8)) c.num_months = randInt(1, 5);
    if (randBool()) c.is_remote = randBool();
    if (randBool()) c.needs_attorney = randBool();
    if (randBool()) c.needs_interpreter = randBool();
    if (randBool(0.8)) c.upcoming_date = randomDateFromNow(30, 180);

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
        start_date: randomDateFromNow(5, 14),
        availability_description: randomParagraph(randInt(0, 30)),
        location: randomLocation()
    };

    return u;
}

function randomInterest(
    listing: CaseListing | LimitedAssistance | TranslationRequest,
    listingType: ListingTypeEnum,
    profile: Profile
): Interest {
    const roles: RoleEnum[] =
        listingType === "CASE"
            ? pickSomeFrom(["ATTORNEY", "INTERPRETER"], randInt(1, 3))
            : listingType === "LIMITED_ASSISTANCE"
            ? ["LEGAL_FELLOW"]
            : ["TRANSLATOR"];

    const it: Interest = {
        listing_id: listing.id,
        user_id: profile.user_id,
        listing_type: listingType,
        form_response: {
            interestReason: randomParagraph(randInt(40, 60)),
            rolesInterested: roles,
            start_date: randomDateFromNow(1, 30)
        }
    };

    return it;
}
