import { readFile } from "fs/promises";
import path from "path";
import { isValidFileType } from "../../rules/valid-file-types/valid-file-types";

describe("isValidFileType", () => {
    it("should return true for valid file types", async () => {
        const file = await readFile(path.join(__dirname, "bird.jpg"));
        const isValid = await isValidFileType(file);
        expect(isValid).toBe(true);
    });

    it("should return false for invalid file types", async () => {
        const file = await readFile(path.join(__dirname, "bird.zip"));
        const isValid = await isValidFileType(file);
        expect(isValid).toBe(false);
    });
});
