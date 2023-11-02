// table fields
export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type ExperienceEnum = "LOW" | "MEDIUM" | "HIGH";

export type RoleEnum =
    | "Attorney"
    | "Interpreter"
    | "Research Fellow"
    | "Translator";

export type AgencyEnum = "Court" | "USCIS";

export type ListingTypeEnum =
    | "Case"
    | "Limited Assistance"
    | "Translation Request";

// misc
export type UserData = {
    id: UUID;
    first_name: string;
    last_name: string;
    email: string;
};

// join table rows
export type CaseLanguage = {
    listing_id: UUID;
    iso_code: string;
};

export type ProfileLanguage = {
    user_id: UUID;
    iso_code: string;
    can_read: boolean;
    can_write: boolean;
};

export type Relief = {
    listing_id: UUID;
    relief_code: string;
};

export type Role = {
    user_id: UUID;
    role: RoleEnum;
};

// table rows
export type CaseListing = {
    id: UUID;
    title?: string;
    summary?: string;
    country?: string;
    client_location?: string;
    legal_server_id: number;
    hours_per_month?: number;
    num_months?: number;
    is_remote?: boolean;
    in_court?: boolean;
    needs_attorney?: boolean;
    needs_interpreter?: boolean;
    upcoming_date?: string;
};

export type Interest = {
    listing_id: UUID;
    user_id: UUID;
    listing_type: ListingTypeEnum;
    form_response: {
        interestReason: string;
        start_date: string;
        rolesInterested: RoleEnum[];
    };
};

export type Profile = {
    user_id: UUID;
    first_name: string;
    last_name: string;
    preferred_first_name?: string;
    location: string; // city, ST
    hours_per_month: number;
    immigration_law_experience: ExperienceEnum;
    bar_number?: string;
    start_date: string;
    availability_description?: string;
    eoir_registered: boolean;
};

export type LimitedAssistance = {
    id: UUID;
    summary: string;
    languages: string[];
    country: string;
    experience_level: ExperienceEnum;
    deadline: string;
    interest_ids: UUID[];
};

export type TranslationRequest = {
    id: UUID;
    summary: string;
    languages: string[];
    interest_ids: UUID[];
};
