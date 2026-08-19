import { AsIsFiles } from "@fern-api/rust-base";
import { describe, expect, it } from "vitest";

describe("CONTRIBUTING.md (AsIs)", () => {
    it("contains Rust commands", async () => {
        const result = await AsIsFiles.ContributingMd.loadContents();
        expect(result).toContain("cargo build");
        expect(result).toContain("cargo test");
        expect(result).toContain("cargo clippy");
        expect(result).toContain("cargo fmt");
    });

    it("includes all expected sections", async () => {
        const result = await AsIsFiles.ContributingMd.loadContents();
        expect(result).toContain("# Contributing");
        expect(result).toContain("## Getting Started");
        expect(result).toContain("### Prerequisites");
        expect(result).toContain("### Installation");
        expect(result).toContain("### Building");
        expect(result).toContain("### Testing");
        expect(result).toContain("### Linting");
        expect(result).toContain("### Formatting");
        expect(result).toContain("## About Generated Code");
        expect(result).toContain("## Making Changes");
        expect(result).toContain("## Questions or Issues?");
        expect(result).toContain("## License");
    });

    it("includes Fern-specific information", async () => {
        const result = await AsIsFiles.ContributingMd.loadContents();
        expect(result).toContain("Fern");
        expect(result).toContain(".fernignore");
        expect(result).toContain("buildwithfern.com");
        expect(result).toContain("github.com/fern-api/fern");
    });

    it("references Rust generator path", async () => {
        const result = await AsIsFiles.ContributingMd.loadContents();
        expect(result).toContain("generators/rust/");
    });

    it("includes Rust prerequisites", async () => {
        const result = await AsIsFiles.ContributingMd.loadContents();
        expect(result).toContain("Rust (latest stable)");
        expect(result).toContain("Cargo");
    });

    it("loads content matching snapshot", async () => {
        const result = await AsIsFiles.ContributingMd.loadContents();
        expect(result).toMatchSnapshot();
    });
});
