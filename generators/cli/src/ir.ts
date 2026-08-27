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
    globalParameters: FernIr.GlobalParameter[];
    /**
     * The API-wide headers (`x-fern-global-headers` / the root API file's
     * `headers:` block) sent on every request. They carry the resolved
     * env-var name and client-side default, and the copied raw specs don't
     * express them, so the generator lowers them into global parameters.
     */
    headers: FernIr.HttpHeader[];
    /**
     * The IR's services, keyed by service id. Used to resolve an OAuth
     * client-credentials scheme's `tokenEndpoint.endpointReference` to a
     * concrete request path when wiring the token URL.
     */
    services: Record<string, FernIr.HttpService>;
    /**
     * The IR's environment configuration, if the API declares one. Used
     * to resolve the base URL the OAuth token endpoint path is joined to.
     */
    environments: FernIr.EnvironmentsConfig | undefined;
    /**
     * The IR's `readmeConfig.whiteLabel`, defaulted to `false`. Set for orgs
     * configured for white-labeling; suppresses the Fern shield in the
     * generated README.
     */
    whiteLabel: boolean;
}

/**
 * Parse the IR file and return the `IrSummary` slice the CLI
 * generator needs for binary identity and auth wiring.
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
export async function readIr(irFilepath: string): Promise<IrSummary> {
    const ir = await readFullIr(irFilepath);

    return {
        apiDisplayName: ir.apiDisplayName,
        auth: { schemes: ir.auth.schemes },
        globalParameters: ir.globalParameters ?? [],
        headers: ir.headers,
        services: ir.services,
        environments: ir.environments,
        whiteLabel: ir.readmeConfig?.whiteLabel ?? false
    };
}

/**
 * Parse the IR file and return the full, typed
 * `FernIr.IntermediateRepresentation`.
 *
 * `readIr` narrows this to the slice the codegen pipeline consumes for
 * binary identity and auth wiring; the wire-test generator instead needs
 * the whole IR — every service, endpoint, and endpoint example — to derive
 * mock-server stubs and CLI invocations. Rather than widen `IrSummary` into
 * a near-copy of the IR, wire tests read the full value through this
 * sibling. Both go through the same permissive `IrSerialization` parse, so
 * a newer IR doesn't hard-fail the generator.
 *
 * Throws with the file path included if the file is missing, the JSON is
 * malformed, or the structure doesn't match the SDK's schema at all.
 */
export async function readFullIr(irFilepath: string): Promise<FernIr.IntermediateRepresentation> {
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

    return parsed.value;
}
