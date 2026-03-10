import path from "path";

import { getViolationsForFile } from "../../rules/valid-file-types/valid-file-types.js";

describe("isValidFileType", () => {
    it("should return true for valid file types", async () => {
        const isValid = await getViolationsForFile(path.join(__dirname, "bird.jpg"));
        expect(isValid).toHaveLength(0);
    });

    it("should return true for tar files", async () => {
        const violations = await getViolationsForFile(path.join(__dirname, "test.tar"));
        expect(violations).toHaveLength(0);
    });

    it("should return true for zip files", async () => {
        const violations = await getViolationsForFile(path.join(__dirname, "bird.zip"));
        expect(violations).toHaveLength(0);
    });

    it("should return true for gzip files (.tar.gz)", async () => {
        const violations = await getViolationsForFile(path.join(__dirname, "test.tar.gz"));
        expect(violations).toHaveLength(0);
    });

    it("should return true for bzip2 files (.tar.bz2)", async () => {
        const violations = await getViolationsForFile(path.join(__dirname, "test.tar.bz2"));
        expect(violations).toHaveLength(0);
    });

    it("should return false for invalid file types", async () => {
        const violations = await getViolationsForFile(path.join(__dirname, "test.exe"));
        expect(violations.length).toBeGreaterThan(0);
    });
});
