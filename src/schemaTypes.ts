import { UUID } from "crypto";

export type Experience = "beginner" | "intermediate" | "advanced" | "expert";
export type Role = "attorney" | "translator" | "interpreter" | "researcher";
export type Program = "CC" | "LDP" | "LOP" | "NQRP" | "FGLOP";

export type CaseListing = {
    id: UUID;
    summary: string;
    languages: string[];
    country: string;
    legal_server_id: number;
    client_initials: string;
    time_to_complete: string;
    is_remote: boolean;
    client_location: string;
    program: Program;
    upcoming_hearing_date: string;
    needs_interpreter: boolean;
    interest_ids: UUID[];
};

export type LimitedAssistance = {
    id: UUID;
    summary: string;
    languages: string[];
    country: string;
    experience_level: Experience;
    deadline: string;
    interest_ids: UUID[];
};

export type TranslationRequest = {
    id: UUID;
    summary: string;
    languages: string[];
    interest_ids: UUID[];
};

export type Interest = {
    id: UUID;
    listing_id: UUID;
    listing_type: string;
    user_id: UUID;
    form_response: {
        whyInterested: string;
        interestType: string[];
    };
};

export type Profile = {
    user_id: UUID;
    name: string;
    roles: Role[];
    languages: string[];
    accreditations: string[];
    hours_per_week: number;
    immigration_law_experience: Experience;
    bar_number: number;
    start_date: string;
    interest_ids: UUID[];
};
