import { FernIr } from "@fern-fern/ir-sdk";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import { readFile } from "fs/promises";

/**
 * Narrow view of the Fern IR — just the slices the CLI generator
 * consumes for binary identity + auth wiring. The IR is the
 * authoritative source for everything except spec bytes: resolved
 * env-var names, the workspace's display name, and per-scheme
 * metadata (`omit`, `prefix`, etc.) that the raw OpenAPI spec
 * doesn't carry.
 *
 * `auth.schemes` is the IR SDK's `FernIr.AuthScheme` union — each
 * element is constructed via `FernIr.AuthScheme.{bearer,basic,…}`
 * during deserialization and carries a `_visit` method downstream
 * code uses for exhaustive dispatch.
 */
export interface IrSummary {
    apiDisplayName: string | undefined;
    auth: { schemes: FernIr.AuthScheme[] };
}

/**
 * Minimal subpackage data needed to build the SDK glue client tree.
 * Mirrors the fields the Rust SDK generator reads from `FernIr.Subpackage`
 * when resolving client names and building the sub-client hierarchy.
 */
export interface SdkGlueSubpackageInfo {
    name: FernIr.NameOrString;
    subpackages: FernIr.SubpackageId[];
    service: FernIr.ServiceId | undefined;
    hasEndpointsInTree: boolean;
}

/**
 * IR data needed by `generateSdkGlue` to derive the client tree.
 *
 * This replaces the previous approach of regex-parsing generated Rust
 * source files. By reading the IR directly, we use the same data the
 * Rust SDK generator uses, ensuring client names (including
 * de-conflicted ones like `SimpleClient2`) are always correct.
 */
export interface SdkGlueIrInfo {
    apiName: FernIr.NameOrString;
    rootPackage: {
        subpackages: FernIr.SubpackageId[];
        service: FernIr.ServiceId | undefined;
    };
    subpackages: Record<FernIr.SubpackageId, SdkGlueSubpackageInfo>;
    casingsConfig: FernIr.CasingsConfig | undefined;
}

/**
 * Combined result of parsing the IR — all slices the CLI generator
 * needs in a single read. Respects the "IR is read once per pipeline
 * run" convention documented in CLAUDE.md.
 */
export interface ParsedIr {
    summary: IrSummary;
    sdkGlueInfo: SdkGlueIrInfo;
}

/**
 * Parse the IR file and return every slice the CLI generator needs.
 *
 * Goes through the IR SDK's serialization layer rather than picking
 * fields off raw `JSON.parse` output, so consumers get fully
 * constructed `FernIr.AuthScheme` instances (with `_visit`) and we
 * don't hand-maintain a shadow union for the IR's auth shape.
 *
 * The parse is permissive on unrecognised fields/enums/union variants
 * so a newer IR doesn't fail the generator outright — unknown scheme
 * `_type`s simply hit the visitor's `_other` case and get skipped at
 * the binding stage.
 *
 * Throws if the file is missing, the JSON is malformed, or the IR
 * structure doesn't match the SDK's schema at all. The orchestrator
 * catches and surfaces these to the user.
 */
export async function readIr(irFilepath: string): Promise<ParsedIr> {
    const raw = await readFile(irFilepath, "utf-8");
    const json: unknown = JSON.parse(raw);

    const parsed = await IrSerialization.IntermediateRepresentation.parse(json, {
        unrecognizedObjectKeys: "passthrough",
        allowUnrecognizedEnumValues: true,
        allowUnrecognizedUnionMembers: true
    });

    if (!parsed.ok) {
        throw new Error(`Failed to parse IR from ${irFilepath}: ${JSON.stringify(parsed.errors, null, 4)}`);
    }

    const ir = parsed.value;

    const subpackages: Record<string, SdkGlueSubpackageInfo> = {};
    for (const [subpackageId, subpackage] of Object.entries(ir.subpackages)) {
        subpackages[subpackageId] = {
            name: subpackage.name,
            subpackages: subpackage.subpackages,
            service: subpackage.service ?? undefined,
            hasEndpointsInTree: subpackage.hasEndpointsInTree
        };
    }

    return {
        summary: {
            apiDisplayName: ir.apiDisplayName,
            auth: { schemes: ir.auth.schemes }
        },
        sdkGlueInfo: {
            apiName: ir.apiName,
            rootPackage: {
                subpackages: ir.rootPackage.subpackages,
                service: ir.rootPackage.service ?? undefined
            },
            subpackages,
            casingsConfig: ir.casingsConfig ?? undefined
        }
    };
}

/**
 * Convenience wrapper that returns only the `IrSummary` slice.
 * Prefer `readIr` when both summary and sdkGlueInfo are needed.
 */
export async function readIrSummary(irFilepath: string): Promise<IrSummary> {
    const { summary } = await readIr(irFilepath);
    return summary;
}
