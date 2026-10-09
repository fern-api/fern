import { describe, expect, it } from "vitest";
import YAML from "yaml";

import { planRetarget, RENAMED_SDK_CONFIG } from "../retargetSdkConfig.js";
import { codes } from "./helpers.js";

const CONFIG_PATH = "/work/fern/sdk-config.yml";
const GENERATORS_PATH = "/work/fern/generators.yml";

const MULTI = `# Acme SDKs
schemaVersion: sdk-config/v1
sdkName: acme
source:
  specs:
    - id: main # the only spec
      type: openapi
      path: ./openapi.yml
output:
  delivery: files
targets:
  - language: typescript # keep me
  - language: cli
    package:
      packageName: acme-cli
  - language: python
`;

const LONE = `schemaVersion: sdk-config/v1
sdkName: acme
source:
  specs:
    - { id: main, type: openapi, path: ./openapi.yml }
output: { delivery: files }
targets:
  - language: cli
`;

function plan(contents: string, existing: string[] = []) {
    return planRetarget({
        configPath: CONFIG_PATH,
        contents,
        generatorsPath: GENERATORS_PATH,
        exists: (path) => existing.includes(path)
    });
}

describe("planRetarget", () => {
    it("removes the cli target and keeps the other targets in order", () => {
        const result = plan(MULTI);
        expect(result.kind).toBe("remove");
        expect(YAML.parse(result.write?.contents ?? "").targets).toEqual([
            { language: "typescript" },
            { language: "python" }
        ]);
    });

    it("keeps every comment in the file", () => {
        const contents = plan(MULTI).write?.contents ?? "";
        expect(contents).toContain("# Acme SDKs");
        expect(contents).toContain("# the only spec");
        expect(contents).toContain("# keep me");
    });

    it("appends the removed target as a commented rollback block", () => {
        const contents = plan(MULTI).write?.contents ?? "";
        expect(contents).toContain(
            "# The cli target moved to sdk-config.rubicon.yml and generators.yml (fern sdk rubicon)."
        );
        expect(contents).toContain("#   - language: cli");
        expect(contents).toContain("#       packageName: acme-cli");
    });

    it("writes sdk-config.rubicon.yml with the cli target only, keeping comments, for reruns", () => {
        const extract = plan(MULTI).extract;
        expect(extract?.path).toBe(`/work/fern/${RENAMED_SDK_CONFIG}`);
        expect(YAML.parse(extract?.contents ?? "").targets).toEqual([
            { language: "cli", package: { packageName: "acme-cli" } }
        ]);
        expect(extract?.contents).toContain("# the only spec");
    });

    it("leaves sdk-config.rubicon.yml alone on a rerun", () => {
        const result = planRetarget({
            configPath: `/work/fern/${RENAMED_SDK_CONFIG}`,
            contents: LONE,
            generatorsPath: GENERATORS_PATH,
            exists: () => true
        });
        expect(result).toMatchObject({ kind: "none", write: undefined, extract: undefined, rename: undefined });
        expect(result.diagnostics).toEqual([]);
    });

    it("stops with RUBICON_RENAME_CONFLICT when removing the target but sdk-config.rubicon.yml exists", () => {
        const result = plan(MULTI, [`/work/fern/${RENAMED_SDK_CONFIG}`]);
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_RENAME_CONFLICT sdk-config.rubicon.yml"]);
    });

    it("renames sdk-config.yml to sdk-config.rubicon.yml when cli was the only target", () => {
        const result = plan(LONE);
        expect(result.kind).toBe("rename");
        expect(result.rename).toEqual({ from: CONFIG_PATH, to: `/work/fern/${RENAMED_SDK_CONFIG}` });
        expect(result.write).toBeUndefined();
    });

    it("stops with RUBICON_RENAME_CONFLICT when sdk-config.rubicon.yml already exists", () => {
        const result = plan(LONE, [`/work/fern/${RENAMED_SDK_CONFIG}`]);
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_RENAME_CONFLICT sdk-config.rubicon.yml"]);
    });

    it("does nothing when there is no cli target", () => {
        const result = plan(MULTI.replace("  - language: cli\n    package:\n      packageName: acme-cli\n", ""));
        expect(result.kind).toBe("none");
        expect(result.rollback).toEqual([]);
    });

    it("returns rollback steps for each case", () => {
        expect(plan(MULTI).rollback).toEqual([
            `Delete the cli group from ${GENERATORS_PATH}.`,
            `Restore the cli target in ${CONFIG_PATH} from the commented block at the end of the file, then delete /work/fern/${RENAMED_SDK_CONFIG}.`
        ]);
        expect(plan(LONE).rollback).toEqual([`Rename /work/fern/${RENAMED_SDK_CONFIG} back to ${CONFIG_PATH}.`]);
    });
});
