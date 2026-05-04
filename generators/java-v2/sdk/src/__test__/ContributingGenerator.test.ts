import { describe, expect, it } from "vitest";

import { ContributingGenerator } from "../contributing/ContributingGenerator.js";

describe("ContributingGenerator", () => {
    it("generates CONTRIBUTING.md with Java commands", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("./gradlew build");
        expect(result).toContain("./gradlew test");
        expect(result).toContain("./gradlew spotlessApply");
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

    it("references Java generator path", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("generators/java-v2/");
    });

    it("includes Java prerequisites", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("Java 11+");
        expect(result).toContain("Gradle");
    });

    it("generates full content snapshot", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toMatchSnapshot();
    });
});
