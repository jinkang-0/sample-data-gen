// deno-lint-ignore-file no-explicit-any
import { iso6393 } from "https://cdn.skypack.dev/iso-639-3@3?dts";
import { ExperienceEnum, RoleEnum, AgencyEnum } from "./schema.ts";
import json from "../sampleData.json" assert { type: "json" };

const { gibberish, sampleFirstNames, sampleLastNames, sampleCities, sampleCountries, sampleStates, sampleStreets, sampleAccreditations } = json;

const LIVING_LANGUAGES = iso6393.filter(l => l.type === 'living');
const LIVING_ISO_CODES = LIVING_LANGUAGES.map(l => l.iso6393);
const LIVING_LANGUAGE_NAMES = LIVING_LANGUAGES.map(l => l.name);

// helper functions

export function pickFrom(arr: Array<any>): any {
    if (!arr) {
        throw new SyntaxError("Illegal argument: array undefined");
    }

    return arr[Math.floor(Math.random() * arr.length)];
}

export function pickSomeFrom(arr: Array<any>, num: number): Array<any> {
    const shuffled = knuthShuffleShallow(arr);
    return shuffled.slice(0, num);
}

// RNG: [min, max)
export function randFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function randInt(min: number, max: number): number {
    return Math.floor(randFloat(min, max));
}

export function randBool(chance=0.5): boolean {
    return Math.random() < chance;
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function randChar(): string {
    const charCode = randInt(97, 122);
    return String.fromCharCode(charCode);
}

// returns a shuffled version of the argument array
// DOES NOT deep copy
export function knuthShuffleShallow(arr: Array<any>): Array<any> {
    const ans = [...arr];
    
    for (let i = ans.length - 1; i > 0; i--) {
        const j = randInt(0, i+1);
        const temp = ans[i];
        ans[i] = ans[j];
        ans[j] = temp;
    }

    return ans;
}

// basic pickers

export function randomLastName(): string {
    return pickFrom(sampleLastNames);
}

export function randomFirstName(): string {
    return pickFrom(sampleFirstNames);
}

export function randomCountry(): string {
    return pickFrom(sampleCountries);
}

export function randomState(): string {
    return pickFrom(sampleStates);
}

export function randomCity(): string {
    return pickFrom(sampleCities);
}

export function randomStreet(): string {
    return pickFrom(sampleStreets);
}

export function randomIsoCode(): string {
    return pickFrom(LIVING_ISO_CODES);
}

export function randomGibberish(): string {
    return pickFrom(gibberish);
}

export function randomRoleEnum(): RoleEnum {
    const roles: RoleEnum[] = ["Attorney", "Interpreter", "Research Fellow", "Translator"];
    return pickFrom(roles);
}


// randomizers
export function randomAgency(): AgencyEnum {
    return pickFrom(["Court", "USCIS"]);
}

export function randomAccreditations(): string[] {
    const numAccreditations = randInt(1,3);
    const shuffled = knuthShuffleShallow(sampleAccreditations);
    return shuffled.slice(0, numAccreditations);
}

export function randomRoles(): RoleEnum[] {
    const roles: RoleEnum[] = ["Attorney", "Translator", "Interpreter", "Research Fellow"];
    const shuffled: RoleEnum[] = knuthShuffleShallow(roles);
    const numRoles = randInt(1, 3);
    return shuffled.slice(0, numRoles);
}

export function randomIsoList(min=1, max=4): string[] {
    const numLangs = randInt(min, max);
    const shuffled = knuthShuffleShallow(LIVING_ISO_CODES);
    return shuffled.slice(0, numLangs);
}

export function randomLanguageNames(min=1, max=4): string[] {
    const numLangs = randInt(min, max);
    const shuffled = knuthShuffleShallow(LIVING_LANGUAGE_NAMES);
    return shuffled.slice(0, numLangs);
}

export function randomExperience(): ExperienceEnum {
    const exps: ExperienceEnum[] = ["No Experience", "One Experience", "Multiple Experiences"];
    return pickFrom(exps);
}

export function randomNumString(length: number): number {
    if (length <= 0) {
        throw SyntaxError(
            "Illegal argument: length cannot be less than or equal to zero!"
        );
    }

    return Math.floor(Math.random() * Math.pow(10, length));
}

export function randomLocation(): string {
    // city, state
    const cityName = pickFrom(sampleCities);
    const state = pickFrom(sampleStates);

    return `${cityName}, ${state}`;
}

export function randomInitials(): string {
    const numInitials = randInt(2, 3);
    const ans = [];

    for (let i = 0; i < numInitials; i++) {
        ans.push(randChar().toUpperCase());
    }

    return ans.join(". ") + ".";
}

export function randomParagraph(words: number): string {
    if (words == 0) {
        return "";
    } else if (words < 0) {
        throw Error(
            "Illegal argument: number of words cannot be negative!"
        );
    }

    // setup
    const sentences: string[] = [];
    let sentence: string[] = [];
    let hasComma = randBool();
    let wordsInSentence = randInt(10, 20);

    // subroutine for ease
    function polishSentenceAndAdd() {
        if (hasComma) {
            const percentile = randFloat(0.4, 0.6);
            const index = Math.floor(sentence.length * percentile);
            sentence[index] += ",";
        }

        // capitalize first word
        sentence[0] = capitalize(sentence[0]);

        // add sentence
        sentences.push(sentence.join(" ") + ".");
    }

    // generate words
    for (let i = 0; i < words; i++) {
        sentence.push(pickFrom(gibberish));
        wordsInSentence -= 1;

        if (wordsInSentence == 0) {
            polishSentenceAndAdd();
            sentence = [];
            hasComma = randBool();
            wordsInSentence = randInt(10, 20);
        }
    }

    // add leftover
    if (sentence.length > 0) {
        polishSentenceAndAdd();
    }

    return sentences.join(" ");
}

export function randomDateFromNow(minDays: number, maxDays: number): string {
    // catch illegal args
    if (minDays <= 0) {
        throw new SyntaxError("Illegal arguments: min cannot be zero or negative!");
    } else if (minDays > maxDays) {
        throw new SyntaxError("Illegal arguments: min cannot be greater than max!");
    }

    // find offset and parse
    const offsetDays = randInt(minDays, maxDays);
    const offsetInMs = offsetDays * 24 * 60 * 60 * 1000;
    const now = new Date();
    const nowInMs = now.getTime();

    const future = new Date(nowInMs + offsetInMs);
    const futureYear = future.getFullYear();
    const futureMonth = (future.getMonth() + 1).toString().padStart(2, '0');
    const futureDay = future.getDate().toString().padStart(2, '0');
    const futureHour = future.getHours().toString().padStart(2, '0');
    const futureMinute = future.getMinutes().toString().padStart(2, '0');
    const futureSeconds = future.getSeconds().toString().padStart(2, '0');

    const plusOrMinus = (randBool())? "-" : "+";
    const tzOffset = randInt(0, 13);

    return `${futureYear}-${futureMonth}-${futureDay} ${futureHour}:${futureMinute}:${futureSeconds} ${plusOrMinus}${tzOffset}:00`;
}

