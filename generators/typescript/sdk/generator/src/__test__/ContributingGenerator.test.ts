import { describe, expect, it } from "vitest";

import { ContributingGenerator } from "../contributing/ContributingGenerator.js";

describe("ContributingGenerator", () => {
    it("generates CONTRIBUTING.md with pnpm package manager", () => {
        const generator = new ContributingGenerator({ packageManager: "pnpm" });
        const result = generator.generate();
        expect(result).toContain("pnpm install");
        expect(result).toContain("pnpm build");
        expect(result).toContain("pnpm test");
        expect(result).toContain("pnpm run lint");
        expect(result).toContain("pnpm run format:check");
        expect(result).toContain("pnpm run check:fix");
        expect(result).not.toContain("yarn");
    });

    it("generates CONTRIBUTING.md with yarn package manager", () => {
        const generator = new ContributingGenerator({ packageManager: "yarn" });
        const result = generator.generate();
        expect(result).toContain("yarn install");
        expect(result).toContain("yarn build");
        expect(result).toContain("yarn test");
        expect(result).toContain("yarn run lint");
        expect(result).not.toContain("pnpm");
    });

    it("includes all expected sections", () => {
        const generator = new ContributingGenerator({ packageManager: "pnpm" });
        const result = generator.generate();
        expect(result).toContain("# Contributing");
        expect(result).toContain("## Getting Started");
        expect(result).toContain("### Prerequisites");
        expect(result).toContain("### Installation");
        expect(result).toContain("### Building");
        expect(result).toContain("### Testing");
        expect(result).toContain("### Linting and Formatting");
        expect(result).toContain("## About Generated Code");
        expect(result).toContain("## Making Changes");
        expect(result).toContain("## Questions or Issues?");
        expect(result).toContain("## License");
    });

    it("includes Fern-specific information", () => {
        const generator = new ContributingGenerator({ packageManager: "pnpm" });
        const result = generator.generate();
        expect(result).toContain("Fern");
        expect(result).toContain(".fernignore");
        expect(result).toContain("buildwithfern.com");
        expect(result).toContain("github.com/fern-api/fern");
    });

    it("includes test type commands", () => {
        const generator = new ContributingGenerator({ packageManager: "pnpm" });
        const result = generator.generate();
        expect(result).toContain("pnpm test:unit");
        expect(result).toContain("pnpm test:wire");
    });

    it("generates full content snapshot", () => {
        const generator = new ContributingGenerator({ packageManager: "pnpm" });
        const result = generator.generate();
        expect(result).toMatchSnapshot();
    });
});
