import { normalizePathSlashes } from "../normalizePath.js";

describe("normalizePathSlashes", () => {
    it("leaves a single-slash path unchanged", () => {
        expect(normalizePathSlashes("/users/{0}/posts")).toBe("/users/{0}/posts");
    });

    it("collapses a duplicate slash from an empty base-path segment", () => {
        // package-yml: api base-path `/{id}` + service base-path `/` + endpoint
        // `/{nestedId}` join into `/{0}//{1}`; the client must request the
        // collapsed path the server exposes.
        expect(normalizePathSlashes("/{0}//{1}")).toBe("/{0}/{1}");
    });

    it("collapses runs of three or more slashes", () => {
        expect(normalizePathSlashes("/a///b////c")).toBe("/a/b/c");
    });

    it("collapses leading duplicate slashes to a single slash", () => {
        expect(normalizePathSlashes("//a/b")).toBe("/a/b");
    });

    it("preserves the scheme separator while collapsing path slashes", () => {
        expect(normalizePathSlashes("https://host//a//b")).toBe("https://host/a/b");
    });

    it("returns an empty string unchanged", () => {
        expect(normalizePathSlashes("")).toBe("");
    });
});
