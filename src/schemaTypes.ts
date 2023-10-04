import { UUID } from "crypto";

export type Experience = "beginner" | "intermediate" | "advanced" | "expert";
export type Role = "attorney" | "translator" | "interpreter" | "researcher";
export type Program = "CC" | "LDP" | "LOP" | "NQRP" | "FGLOP";

export type CaseListing = {
    id: UUID;
    summary: string;
    languages: string[];
    country: string;
    legalServerId: number;
    clientInitials: string;
    timeToComplete: string;
    isRemote: boolean;
    clientLocation: string;
    program: Program;
    upcomingHearingDate: string;
    needsInterpreter: boolean;
    interestIds: UUID[];
};

export type LimitedAssistance = {
    id: UUID;
    summary: string;
    languages: string[];
    country: string;
    experienceLevel: Experience;
    deadline: string;
    interestIds: UUID[];
};

export type TranslationRequest = {
    id: UUID;
    summary: string;
    languages: string[];
    interestIds: UUID[];
};

export type Interest = {
    id: UUID;
    listingId: UUID;
    listingType: string;
    userId: UUID;
    formResponse: {
        whyInterested: string;
        interestType: string[];
    };
};

export type Profile = {
    userId: UUID;
    roles: Role[];
    languages: string[];
    accreditations: string[];
    hoursPerWeek: number;
    immigrationLawExperience: Experience;
    barNumber: number;
    startDate: string;
    interestIds: UUID[];
};
