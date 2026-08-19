import { RootAsIsFiles } from "@fern-api/swift-base";
import { describe, expect, it } from "vitest";

describe("CONTRIBUTING.md root AsIs file", () => {
    it("contains Swift commands", async () => {
        const result = await RootAsIsFiles.Contributing.loadContents();
        expect(result).toContain("swift build");
        expect(result).toContain("swift test");
        expect(result).toContain("swift format");
        expect(result).toContain("swiftformat .");
        expect(result).toContain("swiftlint");
    });

    it("includes all expected sections", async () => {
        const result = await RootAsIsFiles.Contributing.loadContents();
        expect(result).toContain("# Contributing");
        expect(result).toContain("## Getting Started");
        expect(result).toContain("### Prerequisites");
        expect(result).toContain("### Installation");
        expect(result).toContain("### Building");
        expect(result).toContain("### Testing");
        expect(result).toContain("### Formatting");
        expect(result).toContain("### Linting");
        expect(result).toContain("## About Generated Code");
        expect(result).toContain("## Making Changes");
        expect(result).toContain("## Questions or Issues?");
        expect(result).toContain("## License");
    });

    it("includes Fern-specific information", async () => {
        const result = await RootAsIsFiles.Contributing.loadContents();
        expect(result).toContain("Fern");
        expect(result).toContain(".fernignore");
        expect(result).toContain("buildwithfern.com");
        expect(result).toContain("github.com/fern-api/fern");
    });

    it("references Swift generator path", async () => {
        const result = await RootAsIsFiles.Contributing.loadContents();
        expect(result).toContain("generators/swift/");
    });

    it("includes Swift prerequisites", async () => {
        const result = await RootAsIsFiles.Contributing.loadContents();
        expect(result).toContain("Swift 5.9+");
        expect(result).toContain("Swift Package Manager");
    });

    it("has correct filename", () => {
        expect(RootAsIsFiles.Contributing.filename).toBe("CONTRIBUTING.md");
    });

    it("generates full content snapshot", async () => {
        const result = await RootAsIsFiles.Contributing.loadContents();
        expect(result).toMatchSnapshot();
    });
});
