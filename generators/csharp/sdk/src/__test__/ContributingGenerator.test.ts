import { describe, expect, it } from "vitest";

import { ContributingGenerator } from "../contributing/ContributingGenerator.js";

describe("ContributingGenerator", () => {
    it("generates CONTRIBUTING.md with dotnet commands", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("dotnet restore");
        expect(result).toContain("dotnet build");
        expect(result).toContain("dotnet test");
        expect(result).toContain("dotnet format");
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

    it("references C# generator path", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("generators/csharp/");
    });

    it("includes .NET SDK prerequisites", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain(".NET SDK");
        expect(result).toContain("net462");
        expect(result).toContain("net8.0");
        expect(result).toContain("netstandard2.0");
    });

    it("generates full content snapshot", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toMatchSnapshot();
    });
});
