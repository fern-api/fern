/**
 * Smoke test pages derived from the smoke-test docs.yml navigation.
 *
 * Each entry is a path that should return a 200 OK and render without
 * uncaught page errors. Used by smoke.spec.ts.
 */
export const PAGES = [
    // Markdown pages
    "/welcome",
    "/getting-started",

    // REST API reference (specific endpoints)
    "/rest-api/rest-api/list-plants",
    "/rest-api/rest-api/create-plant",
    "/rest-api/rest-api/get-plant"
];
