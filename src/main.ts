import { randomNumString, randInt, randomParagraph, randomInitials, randomCountry, randBool, randomLocation, randomDateFromNow, randomExperience, randomLanguageList, randomRoles, randomProgram, pickFrom, randomAccreditations, pickSomeFrom, randomName } from "./randomizers.ts";
import { Interest, CaseListing, TranslationRequest, Profile, LimitedAssistance } from "./schemaTypes.ts";
import { writeFile } from "fs";
import { randomUUID } from "crypto";

// global config
const NUM_CASES = 100;
const NUM_LIMITED_ASSISTANCES = 66;
const NUM_TRANSLATION_REQUESTS = 80;
const NUM_PROFILES = 180;
const NUM_INTERESTS = 200;

// helpers
const caseLegalServerIds = new Set();

// generate json
const cases: CaseListing[] = [];
const limitedAssistances: LimitedAssistance[] = [];
const translationRequests: TranslationRequest[] = [];
const profiles: Profile[] = [];
const interests: Interest[] = [];

for (let i = 0; i < NUM_CASES; i++) {
    cases.push(randomCaseListing());
}

for (let i = 0; i < NUM_LIMITED_ASSISTANCES; i++) {
    const c = pickFrom(cases);
    limitedAssistances.push(randomLimitedAssistance(c));
}

for (let i = 0; i < NUM_TRANSLATION_REQUESTS; i++) {
    translationRequests.push(randomTranslationRequest());
}

for (let i = 0; i < NUM_PROFILES; i++) {
    profiles.push(randomProfile());
}

for (let i = 0; i < NUM_INTERESTS; i++) {
    const listingType = randInt(0, 3);
    let listing: CaseListing | LimitedAssistance | TranslationRequest;
    let lType = "";

    // pick listing
    if (listingType == 0) {
        listing = pickFrom(cases);
        lType = "Case";
    } else if (listingType == 1) {
        listing = pickFrom(limitedAssistances);
        lType = "Limited Assistance";
    } else {
        listing = pickFrom(translationRequests);
        lType = "Translation Request";
    }

    // pick user
    const u = pickFrom(profiles);

    interests.push(randomInterest(listing, lType, u));
}


// generate CSV
// const casesCSVHeader = "id,summary,languages,country,legal_server_id,client_initials,time_to_complete,is_remote,client_location,program,upcoming_hearing_date,needs_interpreter,interest_ids\n";
// const limitedAssistancesCSVHeader = "id,summary,languages,country,experience_level,deadline,interest_ids\n";
// const translationRequestsCSVHeader = "id,summary,languages,interest_ids\n";
// const interestsCSVHeader = "id,listing_id,listing_type,user_id,form_response\n";
// const profilesCSVHeader = "id,name,roles,languages,accreditations,hours_per_week,immigration_law_experience,bar_number,start_date,interest_ids\n";

// const casesCSVList = [];
// const limitedAssistancesCSVList = [];
// const translationRequestsCSVList = [];
// const interestsCSVList = [];
// const profilesCSVList = [];

// // format cases
// for (let c of cases) {
//     const fLanguages = strArrToJSONStr(c.languages);
//     const fSummary = wrapInQuotes(c.summary);
//     const fInterestIds = strArrToJSONStr(c.interestIds);
//     const fCountry = wrapInQuotes(c.country);
//     const fInitials = wrapInQuotes(c.clientInitials);
//     const fLocation = wrapInQuotes(c.clientLocation);
//     const fTimeToComplete = wrapInQuotes(c.timeToComplete);
//     const fHearingDate = wrapInQuotes(c.upcomingHearingDate);

//     casesCSVList.push(`${c.id},${fSummary},${fLanguages},${fCountry},${c.legalServerId},${fInitials},${fTimeToComplete},${c.isRemote},${fLocation},${c.program},${fHearingDate},${c.needsInterpreter},${fInterestIds}`);
// }

// // format limitedAssistances
// for (let la of limitedAssistances) {
//     const fSummary = wrapInQuotes(la.summary);
//     const fLanguages = strArrToJSONStr(la.languages);
//     const fCountry = wrapInQuotes(la.country);
//     const fInterestIds = strArrToJSONStr(la.interestIds);
//     const fDeadline = wrapInQuotes(la.deadline);

//     limitedAssistancesCSVList.push(`${la.id},${fSummary},${fLanguages},${fCountry},${la.experienceLevel},${fDeadline},${fInterestIds}`);
// }

// // format translationRequests
// for (let t of translationRequests) {
//     const fLanguages = strArrToJSONStr(t.languages);
//     const fSummary = wrapInQuotes(t.summary);
//     const fInterestIds = strArrToJSONStr(t.interestIds);
    
//     translationRequestsCSVList.push(`${t.id},${fSummary},${fLanguages},${fInterestIds}`);
// }

// // format interests
// for (let i of interests) {
//     const formattedInterestType = i.formResponse.interestType.map(t => `""${t}""`).join(",");
//     const fFormResponse = wrapInQuotes(`{""whyInterested"":""${i.formResponse.whyInterested}"", ""interestType"":[${formattedInterestType}]}`);

//     interestsCSVList.push(`${i.id},${i.listingId},${i.listingType},${i.userId},${fFormResponse}`);
// }

// // format profiles
// for (let p of profiles) {
//     const fRoles = strArrToJSONStr(p.roles);
//     const fName = wrapInQuotes(p.name);
//     const fLanguages = strArrToJSONStr(p.languages);
//     const fAccreditations = strArrToJSONStr(p.accreditations);
//     const fInterestIds = strArrToJSONStr(p.interestIds);
//     const fStartDate = wrapInQuotes(p.startDate);

//     profilesCSVList.push(`${p.userId},${fName},${fRoles},${fLanguages},${fAccreditations},${p.hoursPerWeek},${p.immigrationLawExperience},${p.barNumber},${fStartDate},${fInterestIds}`);
// }


// // join strings
// const casesCSVString = casesCSVHeader + casesCSVList.join("\n");
// const limitedAssistancesCSVString = limitedAssistancesCSVHeader + limitedAssistancesCSVList.join("\n");
// const translationRequestsCSVString = translationRequestsCSVHeader + translationRequestsCSVList.join("\n");
// const interestsCSVString = interestsCSVHeader + interestsCSVList.join("\n");
// const profilesCSVString = profilesCSVHeader + profilesCSVList.join("\n");


// // write to CSV
// const resolutionFunc = (file: string) => {
//     return (err) => {
//         if (err) {
//             console.error("An error occurred while writing JSON to file:", err);
//             return;
//         }

//         console.log(`${file} has been successfully saved.`);
//     }
// }

// writeFile("outputs/cases.csv", casesCSVString, 'utf8', resolutionFunc("cases.csv"));
// writeFile("outputs/limitedAssistances.csv", limitedAssistancesCSVString, 'utf8', resolutionFunc("limitedAssistances.csv"));
// writeFile("outputs/translationRequests.csv", translationRequestsCSVString, 'utf8', resolutionFunc("translationRequests.csv"));
// writeFile("outputs/interests.csv", interestsCSVString, 'utf8', resolutionFunc("interests.csv"));
// writeFile("outputs/profiles.csv", profilesCSVString, 'utf8', resolutionFunc("profiles.csv"));



// generate JSON
const allData = {
    cases: cases,
    limitedAssistance: limitedAssistances,
    translationRequests: translationRequests,
    profiles: profiles,
    interests: interests
};
const stringifiedData = JSON.stringify(allData);

// write json
writeFile("./outputs/output.json", stringifiedData, 'utf8', (err) => {
    if (err) {
        console.error("An error occurred while writing JSON to file:", err);
        return;
    }

    console.log("JSON file has been saved to output.json");
});




// helper functions
function randomCaseListing(): CaseListing {
    const randSummaryLength = randInt(40, 60);

    let legalServerId = randomNumString(3);
    while (caseLegalServerIds.has(legalServerId)) {
        legalServerId = randomNumString(3);
    }
    caseLegalServerIds.add(legalServerId);

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
        name: randomName(),
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
            whyInterested: randomParagraph(randInt(40, 60)),
            interestType: pickSomeFrom(profile.roles, numToPick)
        },
        user_id: profile.user_id
    }

    listing.interest_ids.push(it.id);
    profile.interest_ids.push(it.id);

    return it;
}





//
// HELPER FUNCTIONS
//

function wrapInQuotes(str: string) {
    return `"${str}"`;
}

function strArrToJSONStr(arr: Array<string>) {
    return wrapInQuotes(`[${arr.map(el => `""${el}""`).join(",")}]`);
}

function arrToJSONStr(arr: Array<any>) {
    return wrapInQuotes(`[${arr.join(",")}]`);
}


