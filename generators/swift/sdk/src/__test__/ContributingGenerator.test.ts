import { describe, expect, it } from "vitest";

import { ContributingGenerator } from "../contributing/ContributingGenerator.js";

describe("ContributingGenerator", () => {
    it("generates CONTRIBUTING.md with Swift commands", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("swift build");
        expect(result).toContain("swift test");
        expect(result).toContain("swift format");
        expect(result).toContain("swiftformat .");
        expect(result).toContain("swiftlint");
    });

    it("includes all expected sections", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
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

    it("includes Fern-specific information", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("Fern");
        expect(result).toContain(".fernignore");
        expect(result).toContain("buildwithfern.com");
        expect(result).toContain("github.com/fern-api/fern");
    });

    it("references Swift generator path", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("generators/swift/");
    });

    it("includes Swift prerequisites", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("Swift 5.9+");
        expect(result).toContain("Swift Package Manager");
    });

    it("generates full content snapshot", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toMatchSnapshot();
    });
});
