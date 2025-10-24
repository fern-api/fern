import { AbsoluteFilePath } from "../AbsoluteFilePath";
import { isWithinProjectDirectory, validateOutputPath } from "../validateOutputPath";

describe("validateOutputPath", () => {
    it("should reject root directory", () => {
        const result = validateOutputPath(AbsoluteFilePath.of("/"));
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("system directory");
    });

    it("should reject /etc directory", () => {
        const result = validateOutputPath(AbsoluteFilePath.of("/etc"));
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("system directory");
    });

    it("should reject /usr directory", () => {
        const result = validateOutputPath(AbsoluteFilePath.of("/usr"));
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("system directory");
    });

    it("should reject /var directory", () => {
        const result = validateOutputPath(AbsoluteFilePath.of("/var"));
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("system directory");
    });

    it("should reject paths with directory traversal", () => {
        const result = validateOutputPath(AbsoluteFilePath.of("/home/user/../../../etc"));
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("directory traversal");
    });

    it("should accept safe project paths", () => {
        const result = validateOutputPath(AbsoluteFilePath.of("/home/user/project/output"));
        expect(result.isValid).toBe(true);
    });

    it("should accept safe paths within user home", () => {
        const result = validateOutputPath(AbsoluteFilePath.of("/home/user/fern/sdks/typescript"));
        expect(result.isValid).toBe(true);
    });

    it("should reject /home root directory", () => {
        const result = validateOutputPath(AbsoluteFilePath.of("/home"));
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain("/home");
    });

    it("should accept paths in /tmp subdirectories", () => {
        const result = validateOutputPath(AbsoluteFilePath.of("/tmp/my-project/output"));
        expect(result.isValid).toBe(true);
    });
});

describe("isWithinProjectDirectory", () => {
    it("should detect paths within fern directory", () => {
        const result = isWithinProjectDirectory(AbsoluteFilePath.of("/home/user/project/fern/sdks/output"));
        expect(result).toBe(true);
    });

    it("should detect paths within .git directory", () => {
        const result = isWithinProjectDirectory(AbsoluteFilePath.of("/home/user/project/.git/hooks"));
        expect(result).toBe(true);
    });

    it("should return false for non-project paths", () => {
        const result = isWithinProjectDirectory(AbsoluteFilePath.of("/random/path/output"));
        expect(result).toBe(false);
    });
});
