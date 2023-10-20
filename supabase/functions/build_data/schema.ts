export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type Experience = 0 | 1 | 2;
export type Role = "attorney" | "translator" | "interpreter" | "researcher";
export type Program = "CC" | "LDP" | "LOP" | "NQRP" | "FGLOP";
export type Agency = "Court" | "USCIS";
export type LanguageOptions = {
    read: string[];
    write: string[];
};

export type CaseListing = {
    id: UUID;
    title: string;
    summary: string;
    country: string;
    client_location: string;
    legal_server_id: number;
    hours_per_month: number;
    num_months: number;
    languages: string[];
    is_remote: boolean;
    in_court: boolean;
    needs_attorney: boolean;
    needs_interpreter: boolean;
    upcoming_date: string;
    relief_sought: Agency;
    active: boolean;
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
    user_id: UUID;
    listing_type: number;
    form_response: {
        interestReason: string;
        interestType: string[];
    };
};

export type Profile = {
    user_id: UUID;
    first_name: string;
    last_name: string;
    status: number;
    location: string; // city, ST
    roles: Role[];
    hours_per_month: number;
    immigration_law_experience: Experience;
    languages: LanguageOptions;
    bar_number: number;
    start_date: string;
    availability_description: string;
    eoir_registered: boolean;
    interest_ids: UUID[];
};
