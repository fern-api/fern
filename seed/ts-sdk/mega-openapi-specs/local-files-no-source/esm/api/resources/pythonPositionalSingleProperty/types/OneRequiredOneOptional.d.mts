export interface OneRequiredOneOptional {
    required_field: string;
    optional_field?: (string | null) | undefined;
}
