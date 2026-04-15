/**
 * Smoke test pages derived from the smoke-test docs.yml navigation.
 *
 * Each entry is a path that should return a 200 OK and render without
 * uncaught page errors. Used by smoke.spec.ts.
 */
export const PAGES = [
    // Markdown pages
    "/welcome",

    // REST API reference (paths are /<api-section>/<operation-id>)
    "/rest-api/add-plant",
    "/rest-api/get-plant-by-id",

    // Sitemap
    "/sitemap.xml"
];
