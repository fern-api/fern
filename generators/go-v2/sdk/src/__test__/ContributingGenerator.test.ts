import { describe, expect, it } from "vitest";

import { ContributingGenerator } from "../contributing/ContributingGenerator.js";

describe("ContributingGenerator", () => {
    it("generates CONTRIBUTING.md with Go commands", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("go mod tidy");
        expect(result).toContain("go build ./...");
        expect(result).toContain("go test ./...");
        expect(result).toContain("gofmt -w .");
        expect(result).toContain("go fmt ./...");
        expect(result).toContain("go vet ./...");
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
        expect(result).toContain("### Vetting");
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

    it("references Go generator path", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("generators/go-v2/");
    });

    it("includes Go prerequisites", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("Go 1.21+");
    });

    it("generates full content snapshot", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toMatchSnapshot();
    });
});
