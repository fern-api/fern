import { AbsoluteFilePath } from "@fern-api/fs-utils";
import fs from "fs";
import yaml from "js-yaml";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { parseAllowedFailures } from "../commands/mega-test/allowedFailures";
import { buildVirtualWorkspace, constructVirtualGeneratorsYml } from "../commands/mega-test/buildVirtualWorkspace";
import { discoverMegaFixtures, extractOpenApiSpecs, MegaFixture } from "../commands/mega-test/discoverMegaFixtures";
import { filterFixtures } from "../commands/mega-test/filterFixtures";

function makeTempDir(prefix: string): AbsoluteFilePath {
    return AbsoluteFilePath.of(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
}

function makeFixture(rootDir: AbsoluteFilePath, name: string, overrides?: Partial<MegaFixture>): MegaFixture {
    const fixtureDir = AbsoluteFilePath.of(path.join(rootDir, name));
    fs.mkdirSync(fixtureDir, { recursive: true });
    const openApiPath = AbsoluteFilePath.of(path.join(fixtureDir, "openapi.yml"));
    fs.writeFileSync(openApiPath, "openapi: 3.0.0\ninfo: { title: x, version: 1 }\npaths: {}\n");
    return {
        name,
        absolutePathToFixture: fixtureDir,
        openApiSpecs: [
            {
                absolutePathToOpenApi: openApiPath
            }
        ],
        ...overrides
    };
}

describe("discoverMegaFixtures / extractOpenApiSpecs", () => {
    it("extracts OpenAPI specs from a parsed generators.yml", () => {
        const fixtureDir = AbsoluteFilePath.of("/tmp/fake-fixture-imdb");
        const parsed = {
            api: {
                specs: [
                    { openapi: "openapi.yml", overrides: "overrides.yml" },
                    { proto: "proto/api.proto" },
                    { openapi: "v2/openapi.json", overlays: "overlays.yml", origin: "https://x/y" }
                ]
            }
        };

        const specs = extractOpenApiSpecs(parsed, fixtureDir);

        expect(specs).toHaveLength(2);
        expect(specs[0]?.absolutePathToOpenApi).toBe(path.resolve(fixtureDir, "openapi.yml"));
        expect(specs[0]?.absolutePathToOverrides).toBe(path.resolve(fixtureDir, "overrides.yml"));
        expect(specs[1]?.absolutePathToOpenApi).toBe(path.resolve(fixtureDir, "v2/openapi.json"));
        expect(specs[1]?.absolutePathToOverlays).toBe(path.resolve(fixtureDir, "overlays.yml"));
        expect(specs[1]?.origin).toBe("https://x/y");
    });

    it("returns [] when api.specs is missing or not an array", () => {
        expect(extractOpenApiSpecs(null, AbsoluteFilePath.of("/x"))).toEqual([]);
        expect(extractOpenApiSpecs({}, AbsoluteFilePath.of("/x"))).toEqual([]);
        expect(extractOpenApiSpecs({ api: { path: "openapi.yml" } }, AbsoluteFilePath.of("/x"))).toEqual([]);
        expect(extractOpenApiSpecs({ api: { specs: "nope" } }, AbsoluteFilePath.of("/x"))).toEqual([]);
    });

    it("walks a real apis dir and skips fixtures without api.specs", () => {
        const root = makeTempDir("seed-mega-discover-");
        // imdb fixture (valid)
        const imdbDir = path.join(root, "imdb");
        fs.mkdirSync(imdbDir, { recursive: true });
        fs.writeFileSync(path.join(imdbDir, "openapi.yml"), "openapi: 3.0.0\n");
        fs.writeFileSync(
            path.join(imdbDir, "generators.yml"),
            yaml.dump({ api: { specs: [{ openapi: "openapi.yml", namespace: "should-be-overridden" }] } })
        );
        // legacy fixture using api.path — should be skipped
        const legacyDir = path.join(root, "legacy");
        fs.mkdirSync(legacyDir, { recursive: true });
        fs.writeFileSync(path.join(legacyDir, "generators.yml"), yaml.dump({ api: { path: "openapi.yml" } }));
        // fixture without generators.yml
        fs.mkdirSync(path.join(root, "empty"), { recursive: true });

        const fixtures = discoverMegaFixtures({ apisDir: root });

        expect(fixtures.map((f) => f.name)).toEqual(["imdb"]);
        expect(fixtures[0]?.openApiSpecs).toHaveLength(1);
    });
});

describe("constructVirtualGeneratorsYml", () => {
    it("namespaces each spec by fixture name", () => {
        const rootDir = makeTempDir("seed-mega-construct-");
        const fixtures = [makeFixture(rootDir, "imdb"), makeFixture(rootDir, "no-content-response")];
        const workspaceDir = AbsoluteFilePath.of(path.join(rootDir, "workspace"));
        fs.mkdirSync(workspaceDir, { recursive: true });

        const config = constructVirtualGeneratorsYml({ fixtures, absolutePathToWorkspaceDir: workspaceDir });

        expect(config.api.specs.map((s) => s.namespace)).toEqual(["imdb", "no-content-response"]);
        for (const spec of config.api.specs) {
            expect(spec.openapi).toMatch(/openapi\.yml$/);
            // The path must be relative to the workspace dir (no absolute paths in the synthesized yaml).
            expect(path.isAbsolute(spec.openapi)).toBe(false);
        }
    });

    it("forwards overrides, overlays, origin, and settings", () => {
        const rootDir = makeTempDir("seed-mega-fwd-");
        const fixture: MegaFixture = makeFixture(rootDir, "x", {
            openApiSpecs: [
                {
                    absolutePathToOpenApi: AbsoluteFilePath.of(path.join(rootDir, "x", "openapi.yml")),
                    absolutePathToOverrides: AbsoluteFilePath.of(path.join(rootDir, "x", "overrides.yml")),
                    absolutePathToOverlays: AbsoluteFilePath.of(path.join(rootDir, "x", "overlays.yml")),
                    origin: "https://example.com/openapi.yaml",
                    settings: { "title-as-schema-name": true }
                }
            ]
        });
        const workspaceDir = AbsoluteFilePath.of(path.join(rootDir, "workspace"));
        fs.mkdirSync(workspaceDir, { recursive: true });

        const config = constructVirtualGeneratorsYml({ fixtures: [fixture], absolutePathToWorkspaceDir: workspaceDir });
        const spec = config.api.specs[0]!;

        expect(spec.overrides).toMatch(/overrides\.yml$/);
        expect(spec.overlays).toMatch(/overlays\.yml$/);
        expect(spec.origin).toBe("https://example.com/openapi.yaml");
        expect(spec.settings).toEqual({ "title-as-schema-name": true });
    });

    it("throws on duplicate fixture namespaces", () => {
        const rootDir = makeTempDir("seed-mega-dup-");
        const fixtures = [makeFixture(rootDir, "imdb"), makeFixture(rootDir, "imdb2")];
        // Force a name collision after the fact.
        fixtures[1]!.name = "imdb";

        const workspaceDir = AbsoluteFilePath.of(path.join(rootDir, "workspace"));
        expect(() => constructVirtualGeneratorsYml({ fixtures, absolutePathToWorkspaceDir: workspaceDir })).toThrow(
            /duplicate fixture namespace "imdb"/
        );
    });
});

describe("buildVirtualWorkspace", () => {
    let workspaceDir: AbsoluteFilePath;

    beforeEach(() => {
        workspaceDir = AbsoluteFilePath.of(fs.mkdtempSync(path.join(os.tmpdir(), "seed-mega-build-")));
    });

    afterEach(() => {
        fs.rmSync(workspaceDir, { recursive: true, force: true });
    });

    it("writes generators.yml to disk and returns the synthesized config", async () => {
        const rootDir = makeTempDir("seed-mega-build-fixtures-");
        const fixtures = [makeFixture(rootDir, "imdb"), makeFixture(rootDir, "allof-inline")];

        const virtual = await buildVirtualWorkspace({ fixtures, absolutePathToWorkspaceDir: workspaceDir });

        expect(virtual.composedFixtures).toEqual(fixtures);
        const onDisk = yaml.load(fs.readFileSync(path.join(workspaceDir, "generators.yml"), "utf-8")) as unknown;
        expect(onDisk).toEqual(virtual.virtualGeneratorsYml);
        const apiSpecs = (onDisk as { api: { specs: { namespace: string }[] } }).api.specs;
        expect(apiSpecs.map((s) => s.namespace)).toEqual(["imdb", "allof-inline"]);
    });
});

describe("filterFixtures", () => {
    const rootDir = makeTempDir("seed-mega-filter-");
    const all: MegaFixture[] = [
        makeFixture(rootDir, "imdb"),
        makeFixture(rootDir, "allof-inline"),
        makeFixture(rootDir, "ts-only-fixture"),
        makeFixture(rootDir, "python-only-fixture")
    ];

    it("respects include globs", () => {
        const filtered = filterFixtures({ fixtures: all, include: ["imdb*"], generatorName: "ts-sdk" });
        expect(filtered.map((f) => f.name)).toEqual(["imdb"]);
    });

    it("respects exclude globs", () => {
        const filtered = filterFixtures({
            fixtures: all,
            exclude: ["allof-*"],
            generatorName: "ts-sdk"
        });
        // ts-sdk skips language-prefixed fixtures it doesn't own (python-only-fixture)
        expect(filtered.map((f) => f.name).sort()).toEqual(["imdb", "ts-only-fixture"]);
    });

    it("filters out fixtures whose prefix doesn't match the generator's language", () => {
        const filtered = filterFixtures({ fixtures: all, generatorName: "python-sdk" });
        expect(filtered.map((f) => f.name).sort()).toEqual(["allof-inline", "imdb", "python-only-fixture"]);
    });
});

describe("parseAllowedFailures", () => {
    it("returns an empty set for undefined or empty input", () => {
        expect(parseAllowedFailures(undefined).size).toBe(0);
        expect(parseAllowedFailures([]).size).toBe(0);
    });

    it("parses fixtureName entries", () => {
        const names = parseAllowedFailures(["server-sent-events-openapi", "query-param-name-conflict"]);
        expect(names.has("server-sent-events-openapi")).toBe(true);
        expect(names.has("query-param-name-conflict")).toBe(true);
        expect(names.size).toBe(2);
    });

    it("strips :outputFolder suffix from configured-fixture entries", () => {
        const names = parseAllowedFailures(["exhaustive:no-custom-config", "exhaustive:some-other-config"]);
        expect(names.has("exhaustive")).toBe(true);
        expect(names.size).toBe(1);
    });

    it("ignores empty / whitespace entries", () => {
        const names = parseAllowedFailures(["", "   ", "imdb", ":no-fixture-name"]);
        expect(Array.from(names).sort()).toEqual(["imdb"]);
    });
});
