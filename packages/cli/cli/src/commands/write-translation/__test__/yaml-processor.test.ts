import * as yaml from "js-yaml";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CliContext } from "../../../cli-context/CliContext";
import { translateYamlContent } from "../yaml-processor";

vi.mock("../translation-service", () => ({
    translateText: vi.fn(({ text }: { text: string }) => Promise.resolve(`[TRANSLATED] ${text}`))
}));

describe("yaml-processor slug generation", () => {
    let mockCliContext: CliContext;

    beforeEach(() => {
        mockCliContext = {
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn()
            }
        } as unknown as CliContext;
    });

    describe("PageConfiguration", () => {
        it("should add slug to page entries", async () => {
            const sourceYaml = `
navigation:
  - page: Hello World
    path: ./hello.mdx
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            type PageItem = { page: string; path: string; slug?: string };
            type PageDoc = { navigation: PageItem[] };
            const parsed = yaml.load(result) as PageDoc;

            expect(parsed.navigation[0]!.page).toBe("[TRANSLATED] Hello World");
            expect(parsed.navigation[0]!.path).toBe("./hello.mdx");
            expect(parsed.navigation[0]!.slug).toBe("hello-world");
        });

        it("should preserve existing slug from source", async () => {
            const sourceYaml = `
navigation:
  - page: Hello World
    path: ./hello.mdx
    slug: custom-slug
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("custom-slug");
        });

        it("should handle multiple pages", async () => {
            const sourceYaml = `
navigation:
  - page: Getting Started
    path: ./getting-started.mdx
  - page: API Reference
    path: ./api-reference.mdx
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("getting-started");
            expect((parsed.navigation as Array<Record<string, unknown>>)[1]!.slug).toBe("api-reference");
        });
    });

    describe("SectionConfiguration", () => {
        it("should add slug to section entries", async () => {
            const sourceYaml = `
navigation:
  - section: API Guide
    contents:
      - page: Overview
        path: ./overview.mdx
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.section).toBe("[TRANSLATED] API Guide");
            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("api-guide");
            expect(
                (
                    (parsed.navigation as Array<Record<string, unknown>>)[0]!.contents as Array<Record<string, unknown>>
                )[0]!.slug
            ).toBe("overview");
        });

        it("should respect skip-slug for sections", async () => {
            const sourceYaml = `
navigation:
  - section: API Guide
    skip-slug: true
    contents:
      - page: Overview
        path: ./overview.mdx
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBeUndefined();
            expect(
                (
                    (parsed.navigation as Array<Record<string, unknown>>)[0]!.contents as Array<Record<string, unknown>>
                )[0]!.slug
            ).toBe("overview");
        });

        it("should preserve existing slug from source for sections", async () => {
            const sourceYaml = `
navigation:
  - section: API Guide
    slug: custom-section-slug
    contents:
      - page: Overview
        path: ./overview.mdx
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("custom-section-slug");
        });
    });

    describe("ApiReferenceConfiguration", () => {
        it("should add slug to api reference entries using api field", async () => {
            const sourceYaml = `
navigation:
  - api: My API
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.api).toBe("[TRANSLATED] My API");
            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("my-api");
        });

        it("should prefer api-name over api for slug generation", async () => {
            const sourceYaml = `
navigation:
  - api: My API
    api-name: Custom API Name
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("custom-api-name");
        });

        it("should respect skip-slug for api reference", async () => {
            const sourceYaml = `
navigation:
  - api: My API
    skip-slug: true
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBeUndefined();
        });

        it("should preserve existing slug from source for api reference", async () => {
            const sourceYaml = `
navigation:
  - api: My API
    slug: custom-api-slug
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("custom-api-slug");
        });
    });

    describe("ChangelogConfiguration", () => {
        it("should add slug to changelog entries using title", async () => {
            const sourceYaml = `
navigation:
  - changelog: ./changelog
    title: Release Notes
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.title).toBe("[TRANSLATED] Release Notes");
            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("release-notes");
        });

        it("should use changelog path basename when title is missing", async () => {
            const sourceYaml = `
navigation:
  - changelog: ./docs/changelog
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("changelog");
        });

        it("should preserve existing slug from source for changelog", async () => {
            const sourceYaml = `
navigation:
  - changelog: ./changelog
    title: Release Notes
    slug: custom-changelog-slug
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("custom-changelog-slug");
        });
    });

    describe("LinkConfiguration", () => {
        it("should not add slug to link entries", async () => {
            const sourceYaml = `
navigation:
  - link: External Link
    href: https://example.com
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.link).toBe("[TRANSLATED] External Link");
            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.href).toBe("https://example.com");
            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBeUndefined();
        });
    });

    describe("Nested navigation structures", () => {
        it("should handle tabs with nested pages", async () => {
            const sourceYaml = `
navigation:
  - tab: docs
    layout:
      - page: Getting Started
        path: ./getting-started.mdx
      - section: API Guide
        contents:
          - page: Overview
            path: ./overview.mdx
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect(
                ((parsed.navigation as Array<Record<string, unknown>>)[0]!.layout as Array<Record<string, unknown>>)[0]!
                    .slug
            ).toBe("getting-started");
            expect(
                ((parsed.navigation as Array<Record<string, unknown>>)[0]!.layout as Array<Record<string, unknown>>)[1]!
                    .slug
            ).toBe("api-guide");
            expect(
                (
                    (
                        (parsed.navigation as Array<Record<string, unknown>>)[0]!.layout as Array<
                            Record<string, unknown>
                        >
                    )[1]!.contents as Array<Record<string, unknown>>
                )[0]!.slug
            ).toBe("overview");
        });

        it("should handle deeply nested sections", async () => {
            const sourceYaml = `
navigation:
  - section: Level 1
    contents:
      - section: Level 2
        contents:
          - page: Deep Page
            path: ./deep.mdx
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("level-1");
            expect(
                (
                    (parsed.navigation as Array<Record<string, unknown>>)[0]!.contents as Array<Record<string, unknown>>
                )[0]!.slug
            ).toBe("level-2");
            expect(
                (
                    (
                        (parsed.navigation as Array<Record<string, unknown>>)[0]!.contents as Array<
                            Record<string, unknown>
                        >
                    )[0]!.contents as Array<Record<string, unknown>>
                )[0]!.slug
            ).toBe("deep-page");
        });
    });

    describe("Slug generation edge cases", () => {
        it("should handle special characters in titles", async () => {
            const sourceYaml = `
navigation:
  - page: "Hello, World! (2024)"
    path: ./hello.mdx
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("hello-world-2024");
        });

        it("should handle multiple spaces and hyphens", async () => {
            const sourceYaml = `
navigation:
  - page: "Multiple   Spaces---And-Hyphens"
    path: ./test.mdx
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("multiple-spaces-and-hyphens");
        });

        it("should handle leading and trailing spaces", async () => {
            const sourceYaml = `
navigation:
  - page: "  Trimmed Title  "
    path: ./test.mdx
`;

            const result = await translateYamlContent(sourceYaml, "es", "en", "nav.yml", mockCliContext);
            const parsed = yaml.load(result) as Record<string, unknown>;

            expect((parsed.navigation as Array<Record<string, unknown>>)[0]!.slug).toBe("trimmed-title");
        });
    });

    describe("Source language preservation", () => {
        it("should not modify source language content", async () => {
            const sourceYaml = `
navigation:
  - page: Hello World
    path: ./hello.mdx
`;

            const result = await translateYamlContent(sourceYaml, "en", "en", "nav.yml", mockCliContext);

            expect(result).toBe(sourceYaml);
        });
    });
});
