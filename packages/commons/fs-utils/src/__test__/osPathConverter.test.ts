import { AbsoluteFilePath } from "../AbsoluteFilePath.js";
import { convertToFernHostAbsoluteFilePath } from "../osPathConverter.js";

describe("convertToFernHostAbsoluteFilePath", () => {
    it("should strip Windows drive letter with backslash", () => {
        // Simulating a Windows path that uses backslashes (e.g., C:\Users\...)
        // After convertToOsPath normalization, this becomes C:/Users/...
        const windowsPath = "C:\\Users\\fchu\\docs\\images\\logo.png" as AbsoluteFilePath;
        const result = convertToFernHostAbsoluteFilePath(windowsPath);
        expect(result).toBe("/Users/fchu/docs/images/logo.png");
    });

    it("should strip Windows drive letter with forward slash", () => {
        // After resolve() normalization, Windows paths use forward slashes: C:/Users/...
        const windowsPath = "C:/Users/fchu/docs/images/logo.png" as AbsoluteFilePath;
        const result = convertToFernHostAbsoluteFilePath(windowsPath);
        expect(result).toBe("/Users/fchu/docs/images/logo.png");
    });

    it("should handle Unix paths unchanged", () => {
        const unixPath = "/home/user/docs/images/logo.png" as AbsoluteFilePath;
        const result = convertToFernHostAbsoluteFilePath(unixPath);
        expect(result).toBe("/home/user/docs/images/logo.png");
    });

    it("should handle Windows path with lowercase drive letter", () => {
        const windowsPath = "d:/projects/docs/images/logo.png" as AbsoluteFilePath;
        const result = convertToFernHostAbsoluteFilePath(windowsPath);
        expect(result).toBe("/projects/docs/images/logo.png");
    });
});
