/**
 * Smoke test pages derived from the smoke-test docs.yml navigation.
 *
 * Each entry is a path that should return a 200 OK and render without
 * uncaught page errors. Used by smoke.spec.ts.
 */
export const PAGES = [
    // Markdown pages
    "/welcome",

    // REST API reference
    "/rest-api/plant/add-plant",
    "/rest-api/plant/get-plant-by-id",

    // Sitemap
    "/sitemap.xml"
];
