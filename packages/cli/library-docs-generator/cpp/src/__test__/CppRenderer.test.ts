/**
 * C++ Renderer Reference Page Convergence Tests
 *
 * Each test renders a fixture's input.json through the renderer and
 * compares against expected.mdx via snapshots. The actual rendered
 * output is written to actual.mdx for manual diff inspection.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

import { renderCompoundPage } from "../renderers/CompoundPageRenderer.js";
import type { CppClassIr, CppConceptIr } from "../../../src/types/CppLibraryDocsIr.js";
import { FIXTURES_DIR, FIXTURES, metaToCompoundMeta, type FixtureMeta } from "./fixture-utils.js";

// Only run fixture tests when fixture data is present (gitignored for CI)
const AVAILABLE_FIXTURES = FIXTURES.filter((name) =>
    fs.existsSync(path.join(FIXTURES_DIR, name, "input.json")),
);

describe("C++ Renderer Reference Page Convergence", () => {
    if (AVAILABLE_FIXTURES.length === 0) {
        it.skip("no fixtures available (run locally with fixture data)", () => {});
        return;
    }

    for (const name of AVAILABLE_FIXTURES) {
        it(`renders ${name}`, () => {
            const dir = path.join(FIXTURES_DIR, name);
            const input = JSON.parse(fs.readFileSync(path.join(dir, "input.json"), "utf-8"));
            const meta: FixtureMeta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf-8"));

            const compoundMeta = metaToCompoundMeta(meta);
            const kind = meta.compound_kind === "concept" ? "concept" : "class";
            const compound = { kind, data: input } as
                | { kind: "class"; data: CppClassIr }
                | { kind: "concept"; data: CppConceptIr };

            const actual = renderCompoundPage(compound, compoundMeta);

            // Write actual output for manual diff inspection
            fs.writeFileSync(path.join(dir, "actual.mdx"), actual);

            expect(actual).toMatchSnapshot();
        });
    }
});
