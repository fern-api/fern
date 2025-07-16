import path from "path";

import { getViolationsForFile } from "../../rules/valid-file-types/valid-file-types";

describe("isValidFileType", () => {
    it("should return true for valid file types", async () => {
        const isValid = await getViolationsForFile(path.join(__dirname, "bird.jpg"));
        expect(isValid).toHaveLength(0);
    });

    it("should return false for invalid file types", async () => {
        const isValid = await getViolationsForFile(path.join(__dirname, "bird.zip"));
        expect(isValid.length).toBeGreaterThan(0);
    });
});
