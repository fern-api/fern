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
 * Read the IR file at `irFilepath` and return the narrow summary.
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
export async function readIrSummary(irFilepath: string): Promise<IrSummary> {
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

    return {
        apiDisplayName: parsed.value.apiDisplayName,
        auth: { schemes: parsed.value.auth.schemes }
    };
}
