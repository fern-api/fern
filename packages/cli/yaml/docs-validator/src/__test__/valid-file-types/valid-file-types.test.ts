import path from "path";
import { isValidFileType } from "../../rules/valid-file-types/valid-file-types";

describe("isValidFileType", () => {
    it("should return true for valid file types", async () => {
        const isValid = await isValidFileType(path.join(__dirname, "bird.jpg"));
        expect(isValid).toBe(true);
    });

    it("should return false for invalid file types", async () => {
        const isValid = await isValidFileType(path.join(__dirname, "bird.zip"));
        expect(isValid).toBe(false);
    });
});
