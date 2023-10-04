//
// RECOMMENDED TO TEST RIGHT AFTER GENERATING
//

import assert from "assert";

// import data
import json from "../outputs/output.json" assert { type: "json" };
const { cases, interests, limitedAssistance, translationRequests, users } = json;

// helpful storage
const listingIds = new Set();
const interestIds = new Set();

// check that listing IDs are unique
function assertNoListingIdDuplicates() {
    const errorMsg = "Test failed: listing IDs should not have duplicates!";
    
    for (let c of cases) {
        const id = c.listingId;
        assert(!listingIds.has(id), errorMsg);
        listingIds.add(id);
    }
    
    for (let t of translationRequests) {
        const id = t.listingId;
        assert(!listingIds.has(id), errorMsg);
        listingIds.add(id);
    }
    
    for (let l of limitedAssistance) {
        const id = l.listingId;
        assert(!listingIds.has(id), errorMsg);
        listingIds.add(id);
    }

    for (let i of interests) {
        const id = i.listingId;
        assert(!listingIds.has(id), errorMsg);
        listingIds.add(id);
    }
}

// check that interest ids are unique
function assertNoInterestIdDuplicates() {
    const errorMsg = "Test failed: interest IDs should be unique!";

    for (let i of interests) {
        const id = i.interestId;
        assert(!interestIds.has(id), errorMsg);
        interestIds.add(id);
    }
}

// check that interests' listing id has a match
function assertInterestsLinkToListings() {
    const errorMsg = "Test failed: interests should have a corresponding non-interest listing."
    
    for (let c of cases) {
        const interestList = c.interests;
        for (let i of interestList) {
            assert(interestIds.has(i), errorMsg);
        }
    }

    for (let l of limitedAssistance) {
        const interestList = l.interests;
        for (let i of interestList) {
            assert(interestIds.has(i), errorMsg);
        }
    }

    for (let t of translationRequests) {
        const interestList = t.interests;
        for (let i of interestList) {
            assert(interestIds.has(i), errorMsg);
        }
    }
}

// check that dates are valid
function assertValidDates() {
    const now = (new Date()).getTime();
    const errorMsg = "Test failed: all dates should be in the future.";

    for (let c of cases) {
        const toc = c.timeToComplete;
        const hearing = c.upcomingHearingDate;
        assert(toc > now, errorMsg);
        assert(hearing > now, errorMsg);
    }

    for (let l of limitedAssistance) {
        const deadline = l.deadline;
        assert(deadline > now, errorMsg);
    }
}

// run tests
assertNoListingIdDuplicates();
assertNoInterestIdDuplicates();
assertInterestsLinkToListings();
assertValidDates();

// yay
console.log("All tests passed.");
