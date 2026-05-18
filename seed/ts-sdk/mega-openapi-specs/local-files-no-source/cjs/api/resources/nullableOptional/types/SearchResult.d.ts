/**
 * Undiscriminated union for testing
 */
export type SearchResult = {
    type: "user";
} | {
    type: "organization";
} | {
    type: "document";
};
