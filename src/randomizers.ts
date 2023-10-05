import { Experience, Program, Role } from "./schemaTypes";
import json from "./sampleData.json" assert { type: "json" };

const { gibberish, sampleFirstNames, sampleLastNames, sampleCities, sampleCountries, sampleLanguages, sampleStates, sampleStreets, sampleAccreditations } = json;

// helper functions

export function pickFrom(arr: Array<any>): any {
    if (!arr) {
        throw new SyntaxError("Illegal argument: array undefined");
    }

    return arr[Math.floor(Math.random() * arr.length)];
}

export function pickSomeFrom(arr: Array<any>, num: number): any {
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

export function randBool(): boolean {
    return Math.random() > 0.5;
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
        let j = randInt(0, i+1);
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

export function randomLanguage(): string {
    return pickFrom(sampleLanguages);
}

// randomizers

export function randomAccreditations(): string[] {
    const numAccreditations = randInt(1,3);
    const shuffled = knuthShuffleShallow(sampleAccreditations);
    return shuffled.slice(0, numAccreditations);
}

export function randomRoles(): Role[] {
    const roles: Role[] = ["attorney", "translator", "interpreter", "researcher"];
    const shuffled: Role[] = knuthShuffleShallow(roles);
    const numRoles = randInt(1, 3);
    return shuffled.slice(0, numRoles);
}

export function randomLanguageList(): string[] {
    const numLangs = randInt(1, 4);
    const shuffled = knuthShuffleShallow(sampleLanguages);
    const langs = shuffled.slice(0, numLangs);
    return langs;
}

export function randomProgram(): Program {
    const programs: Program[] = ["CC", "FGLOP", "LDP", "LOP", "NQRP"];
    return pickFrom(programs);
}

export function randomExperience(): Experience {
    const exps: Experience[] = ["beginner", "intermediate", "advanced", "expert"];
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
    if (words <= 0) {
        throw SyntaxError(
            "Illegal argument: number of words cannot be zero or negative!"
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

