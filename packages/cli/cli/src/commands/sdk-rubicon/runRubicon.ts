import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { TaskContext } from "@fern-api/task-context";
import type { SdkConfigIrV1 } from "@postman/sdk-config";

import { loadSdkConfigV1 } from "../generate/loadSdkConfigV1.js";
import { carryOver } from "./carryOver.js";
import { expandCliTarget } from "./expandCliTarget.js";
import { mapSdkConfigToGeneratorsYml } from "./mapSdkConfigToGeneratorsYml.js";
import { planGeneratorsSlot } from "./planGeneratorsSlot.js";
import { planRetarget, type RetargetPlan } from "./retargetSdkConfig.js";
import { resolveFromConfigDir } from "./rules/output.js";
import { loadSpecFacts } from "./specFacts.js";
import type { RubiconDiagnostic, SpecFacts } from "./types.js";
import { DEFAULT_GENERATOR_VERSION } from "./versions.js";
import { applyFileChanges, type FileChanges, mergeOverlays, planFileChanges } from "./writeGeneratorsConfiguration.js";

export interface RubiconOptions {
    context: TaskContext;
    configPath: string;
    /** Folder generators.yml is written to. */
    outDir: string;
    apiName: string;
    organization: string;
    /** Whether to create fern.config.json in `outDir` (the project has none). */
    createFernConfig: boolean;
    /** `--generator-version`; a version pinned in sdk-config.yml wins. */
    generatorVersion: string | undefined;
    force: boolean;
    dryRun: boolean;
    strict: boolean;
}

export interface RubiconResult {
    diagnostics: RubiconDiagnostic[];
    /** True when files were changed on disk. */
    written: boolean;
    dryRun: boolean;
    generatorsPath: string;
    /** The planned changes, when the run got as far as planning them. */
    changes: FileChanges | undefined;
    retarget: RetargetPlan["kind"];
    renames: Array<{ from: string; to: string }>;
    carried: string[];
    /** Generator options that fell back to the generator's defaults. */
    defaulted: string[];
    notes: string[];
    hints: string[];
    rollback: string[];
}

const DEFAULTED_OPTIONS: Array<[string, string]> = [
    ["binaryName", "from the API display name"],
    ["customCommands", "on"],
    ["profiles", "off"]
];

/** Runs one rubicon translation: load, expand, inspect specs, classify and map, plan, then write. */
export async function runRubicon(options: RubiconOptions): Promise<RubiconResult> {
    const configDir = dirname(options.configPath);
    const generatorsPath = join(options.outDir, "generators.yml");
    const result: RubiconResult = {
        diagnostics: [],
        written: false,
        dryRun: options.dryRun,
        generatorsPath,
        changes: undefined,
        retarget: "none",
        renames: [],
        carried: [],
        defaulted: [],
        notes: [],
        hints: [],
        rollback: []
    };

    const loaded = await loadSdkConfigV1(options.configPath);
    const expanded = expandCliTarget(loaded.config, {
        apiName: options.apiName,
        organizationName: options.organization
    });
    if (expanded.ir == null) {
        return { ...result, diagnostics: expanded.diagnostics };
    }
    const ir = expanded.ir;

    const inspected = await inspectSpecs(options.context, ir, configDir);
    const mapped = mapSdkConfigToGeneratorsYml(ir, {
        configDir,
        outDir: options.outDir,
        specFacts: inspected.facts,
        generatorVersion: ir.target.generatorVersion ?? options.generatorVersion ?? DEFAULT_GENERATOR_VERSION
    });
    const slot = await planGeneratorsSlot({ folder: options.outDir, force: options.force });
    const carried = carryOver(slot.slot?.previous, mapped.generatorsYml);
    const retarget = planRetarget({
        configPath: options.configPath,
        contents: await readFile(options.configPath, "utf8"),
        generatorsPath,
        exists: existsSync
    });

    const diagnostics = [
        ...inspected.diagnostics,
        ...mapped.diagnostics,
        ...multiSpecWarning(ir, carried.carried),
        ...slot.diagnostics,
        ...retarget.diagnostics
    ];
    const blocked = diagnostics.some(
        (diagnostic) => diagnostic.severity === "error" || (options.strict && diagnostic.severity === "warning")
    );
    const report: RubiconResult = {
        ...result,
        diagnostics,
        retarget: retarget.kind,
        carried: carried.carried,
        defaulted: DEFAULTED_OPTIONS.filter(([key]) => !carried.carried.some((path) => path.endsWith(`.${key}`))).map(
            ([key, value]) => `${key} (${value})`
        ),
        notes: ir.api.auth == null ? [NO_AUTH_NOTE] : [],
        hints: mapped.hints
    };
    if (blocked || slot.slot == null) {
        return report;
    }

    const changes = await planFileChanges({
        generatorsPath,
        generatorsYml: carried.generatorsYml,
        overlayMerges: mapped.overlayMerges,
        renames: [...slot.slot.renames, ...(retarget.rename != null ? [retarget.rename] : [])],
        removals: slot.slot.removals,
        sdkConfigWrites: [retarget.write, retarget.extract].filter((write) => write != null),
        fernConfig: options.createFernConfig
            ? { path: join(options.outDir, "fern.config.json"), organization: options.organization }
            : undefined
    });
    const planned: RubiconResult = {
        ...report,
        changes,
        renames: [...slot.slot.renames, ...(retarget.rename != null ? [retarget.rename] : [])],
        rollback: [...slot.slot.rollback, ...retarget.rollback]
    };
    if (options.dryRun) {
        return planned;
    }
    await applyFileChanges(changes);
    return { ...planned, written: true };
}

const NO_AUTH_NOTE =
    "sdk-config.yml has no api.auth. If it came from `fern sdk migrate`, migrate may have dropped the auth block; add auth-schemes and api.auth to generators.yml by hand if the CLI needs them.";

function multiSpecWarning(ir: SdkConfigIrV1, carried: string[]): RubiconDiagnostic[] {
    if (ir.source.specs.length < 2 || carried.some((path) => path.endsWith(".binaryName"))) {
        return [];
    }
    return [
        {
            severity: "warning",
            path: "source.specs",
            code: "RUBICON_MULTI_SPEC_BINARY_NAME",
            message:
                "With several specs and no binaryName, the generator names the binary and crates from the API display name, so every generated name changes.",
            action: "Set binaryName under groups.cli.generators[0].config in generators.yml; rerunning rubicon keeps it."
        }
    ];
}

/** Loads each OpenAPI spec the way `fern generate` does, merging several overlays into a temporary file. */
async function inspectSpecs(
    context: TaskContext,
    ir: SdkConfigIrV1,
    configDir: string
): Promise<{ facts: Array<SpecFacts | undefined>; diagnostics: RubiconDiagnostic[] }> {
    const temporary = await mkdtemp(join(tmpdir(), "fern-rubicon-"));
    try {
        const results = await Promise.all(
            ir.source.specs.map(async (spec, index) => {
                if (/^https?:\/\//.test(spec.specUrl) || !["openapi", "swagger"].includes(spec.specType)) {
                    // The specs rule reports these.
                    return { facts: undefined, diagnostics: [] };
                }
                const resolve = (path: string) => resolveFromConfigDir(configDir, path);
                const overlays = (spec.overlays ?? []).map(resolve);
                const [firstOverlay] = overlays;
                let overlayPath = firstOverlay;
                if (overlays.length > 1) {
                    overlayPath = join(temporary, `overlay-${index}.yml`);
                    await writeFile(overlayPath, await mergeOverlays(overlays));
                }
                return loadSpecFacts({
                    context,
                    specPath: resolve(spec.specUrl),
                    overridePaths: (spec.overrides ?? []).map(resolve),
                    overlayPath,
                    diagnosticPath: `source.specs[${index}]`
                });
            })
        );
        return {
            facts: results.map((entry) => entry.facts),
            diagnostics: results.flatMap((entry) => entry.diagnostics)
        };
    } finally {
        await rm(temporary, { recursive: true, force: true });
    }
}

export function formatDiagnostic(diagnostic: RubiconDiagnostic): string {
    return `[${diagnostic.severity}] [${diagnostic.code}] ${diagnostic.path}: ${diagnostic.message}${
        diagnostic.action != null ? `; ${diagnostic.action}` : ""
    }`;
}

/** The lines printed after a run: what happened, defaults, carried keys, rollback and the next command. */
export function formatReport(result: RubiconResult, { api }: { api: string | undefined }): string[] {
    const lines: string[] = [];
    if (result.changes == null) {
        return lines;
    }
    if (result.dryRun) {
        lines.push("Dry run: no files were changed.");
    }
    lines.push(`${result.written ? "Wrote" : "Would write"} ${result.generatorsPath}`);
    for (const rename of result.renames) {
        lines.push(`${result.written ? "Renamed" : "Would rename"} ${rename.from} to ${rename.to}`);
    }
    if (result.retarget === "remove") {
        lines.push(`${result.written ? "Removed" : "Would remove"} the cli target from sdk-config.yml.`);
    }
    if (result.defaulted.length > 0) {
        lines.push(
            `SDK Config cannot hold these generator options, so the generator uses its defaults: ${result.defaulted.join(", ")}. Set them under groups.cli.generators[0].config in generators.yml; rerunning rubicon keeps them.`
        );
    }
    if (result.carried.length > 0) {
        lines.push(`Kept from the previous generators.yml: ${result.carried.join(", ")}.`);
    }
    lines.push(...result.notes);
    lines.push(...result.hints);
    if (result.rollback.length > 0) {
        lines.push("Rollback instructions:");
        result.rollback.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
    }
    const apiFlag = api != null ? ` --api ${api}` : "";
    lines.push("Next:");
    lines.push(`  fern generate${apiFlag} --group cli`);
    lines.push(`  FERN_USE_SDK_GEN_API=true fern generate${apiFlag} --group cli --version <version>`);
    return lines;
}
