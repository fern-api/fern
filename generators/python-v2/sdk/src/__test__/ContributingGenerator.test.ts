import { describe, expect, it } from "vitest";

import { ContributingGenerator } from "../contributing/ContributingGenerator.js";

describe("ContributingGenerator", () => {
    it("generates CONTRIBUTING.md with Python commands", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("poetry install");
        expect(result).toContain("poetry build");
        expect(result).toContain("poetry run pytest");
        expect(result).toContain("poetry run ruff check .");
        expect(result).toContain("poetry run ruff format .");
        expect(result).toContain("poetry run mypy .");
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
        expect(result).toContain("### Linting and Formatting");
        expect(result).toContain("### Type Checking");
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

    it("references Python generator path", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("generators/python-v2/");
    });

    it("includes Python prerequisites", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toContain("Python 3.9+");
        expect(result).toContain("pip");
        expect(result).toContain("poetry");
    });

    it("generates full content snapshot", () => {
        const generator = new ContributingGenerator();
        const result = generator.generate();
        expect(result).toMatchSnapshot();
    });
});
