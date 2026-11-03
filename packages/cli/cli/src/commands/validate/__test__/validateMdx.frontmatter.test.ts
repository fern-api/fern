import { describe, expect, it } from "vitest";
import { getFrontmatterError } from "../validateMdx.js";

describe("getFrontmatterError", () => {
    it("accepts valid frontmatter", () => {
        expect(getFrontmatterError('---\ntitle: a\ndescription: "C:\\\\path"\n---\n\nbody')).toBeUndefined();
    });

    it("reports an invalid YAML escape in a double-quoted scalar", () => {
        const error = getFrontmatterError('---\ntitle: a\ndescription: "Prints \\M"\n---\n\nbody');
        expect(error).toBeDefined();
        expect(error).toMatch(/escape|unknown/i);
    });
});
