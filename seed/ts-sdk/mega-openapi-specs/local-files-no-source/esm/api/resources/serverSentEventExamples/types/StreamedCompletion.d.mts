export interface StreamedCompletion {
    delta: string;
    tokens?: (number | null) | undefined;
}
