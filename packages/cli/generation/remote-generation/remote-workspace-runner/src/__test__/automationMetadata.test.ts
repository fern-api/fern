import type { generatorsYml } from "@fern-api/configuration";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { findGeneratorLineNumber, GeneratorOccurrenceTracker } from "../automationMetadata.js";

describe("findGeneratorLineNumber", () => {
    let tmpDir: string;
    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), "fern-automation-metadata-"));
    });
    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    function writeYml(content: string): string {
        const path = join(tmpDir, "generators.yml");
        writeFileSync(path, content, "utf8");
        return path;
    }

    it("returns the 1-indexed line of the generator entry", async () => {
        const path = writeYml(`groups:
  python-sdk:
    generators:
      - name: fernapi/fern-python-sdk
        version: 0.1.0
`);
        expect(await findGeneratorLineNumber(path, "fernapi/fern-python-sdk", 0)).toBe(4);
    });

    it("disambiguates duplicate generator names via occurrenceIndex", async () => {
        const path = writeYml(`groups:
  a:
    generators:
      - name: fernapi/fern-python-sdk
        version: 0.1.0
  b:
    generators:
      - name: fernapi/fern-python-sdk
        version: 0.2.0
`);
        expect(await findGeneratorLineNumber(path, "fernapi/fern-python-sdk", 0)).toBe(4);
        expect(await findGeneratorLineNumber(path, "fernapi/fern-python-sdk", 1)).toBe(8);
    });

    it("matches the short form when the canonicalized name has a fernapi/ prefix", async () => {
        // The configuration loader prefixes first-party generators with `fernapi/`, but the raw
        // YAML commonly uses the short form. The lookup must strip the prefix to find a match.
        const path = writeYml(`groups:
  x:
    generators:
      - name: fern-typescript-sdk
        version: 3.0.0
`);
        expect(await findGeneratorLineNumber(path, "fernapi/fern-typescript-sdk", 0)).toBe(4);
    });

    it("strips surrounding quotes when comparing names", async () => {
        const path = writeYml(`groups:
  x:
    generators:
      - name: "fernapi/fern-go-sdk"
        version: 1.0.0
`);
        expect(await findGeneratorLineNumber(path, "fernapi/fern-go-sdk", 0)).toBe(4);
    });

    it("returns undefined for an unreadable path", async () => {
        expect(await findGeneratorLineNumber(join(tmpDir, "does-not-exist.yml"), "whatever", 0)).toBeUndefined();
    });

    it("returns undefined when the generator name is not found", async () => {
        const path = writeYml(`groups:\n  x:\n    generators:\n      - name: other\n`);
        expect(await findGeneratorLineNumber(path, "missing", 0)).toBeUndefined();
    });

    it("ignores nested non-list-item `name:` keys that happen to equal a generator name", async () => {
        // publishInfo has a `name:` key. Only `- name: <slug>` list items count as generator
        // entries, so the generator's `name:` line (4) wins over the nested one (7).
        const path = writeYml(`groups:
  x:
    generators:
      - name: fern-typescript-sdk
        version: 1.0.0
        publishInfo:
          name: fern-typescript-sdk
`);
        expect(await findGeneratorLineNumber(path, "fern-typescript-sdk", 0)).toBe(4);
    });

    it("tolerates trailing YAML comments on the generator's name line", async () => {
        const path = writeYml(`groups:
  x:
    generators:
      - name: fern-typescript-sdk  # TODO: bump major
        version: 3.0.0
`);
        expect(await findGeneratorLineNumber(path, "fernapi/fern-typescript-sdk", 0)).toBe(4);
    });

    it("ignores list-item `name:` values that contain disallowed characters", async () => {
        // A publisher / package with a multi-word name could masquerade as a `- name:` entry.
        // Generator names are slugs — anything with whitespace is rejected.
        const path = writeYml(`random-list:
  - name: Fern Demo Reviewers
groups:
  x:
    generators:
      - name: fern-typescript-sdk
        version: 1.0.0
`);
        expect(await findGeneratorLineNumber(path, "fern-typescript-sdk", 0)).toBe(6);
    });
});

describe("GeneratorOccurrenceTracker", () => {
    function gen(name: string): generatorsYml.GeneratorInvocation {
        return { name } as unknown as generatorsYml.GeneratorInvocation;
    }

    it("assigns declaration-order indices to same-named generators", () => {
        const t = new GeneratorOccurrenceTracker();
        const a1 = gen("a");
        const a2 = gen("a");
        const a3 = gen("a");
        t.recordOccurrences([a1, a2, a3]);
        expect(t.lookup(a1)).toBe(0);
        expect(t.lookup(a2)).toBe(1);
        expect(t.lookup(a3)).toBe(2);
    });

    it("tracks different names independently", () => {
        const t = new GeneratorOccurrenceTracker();
        const a1 = gen("a");
        const b1 = gen("b");
        const a2 = gen("a");
        const b2 = gen("b");
        t.recordOccurrences([a1, b1, a2, b2]);
        expect(t.lookup(a1)).toBe(0);
        expect(t.lookup(b1)).toBe(0);
        expect(t.lookup(a2)).toBe(1);
        expect(t.lookup(b2)).toBe(1);
    });

    it("preserves indices regardless of lookup call order (skipped before or after running)", () => {
        // Simulates generators.yml order: [skipped, running, skipped] — the tracker stamps each
        // in declaration order. Later lookups from any call order return the YAML-correct index.
        const t = new GeneratorOccurrenceTracker();
        const skipped1 = gen("x");
        const running = gen("x");
        const skipped2 = gen("x");
        t.recordOccurrences([skipped1, running, skipped2]);

        // Lookup order mirrors our real-world two-pass flow: all skips first, then runs.
        expect(t.lookup(skipped1)).toBe(0);
        expect(t.lookup(skipped2)).toBe(2);
        expect(t.lookup(running)).toBe(1);
    });

    it("returns 0 for unregistered generators rather than throwing", () => {
        const t = new GeneratorOccurrenceTracker();
        expect(t.lookup(gen("x"))).toBe(0);
    });

    it("accumulates across multiple recordOccurrences calls", () => {
        const t = new GeneratorOccurrenceTracker();
        const a1 = gen("a");
        const a2 = gen("a");
        t.recordOccurrences([a1]);
        t.recordOccurrences([a2]);
        expect(t.lookup(a1)).toBe(0);
        expect(t.lookup(a2)).toBe(1);
    });
});
