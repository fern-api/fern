/**
 * Generate `cli/<binaryName>/sdk_glue.rs` — the adapter that bridges
 * the CLI's runtime (`AppContext`, `CliExecutor`) to the co-generated
 * SDK crate's typed client.
 *
 * Provides two public helpers for custom command handlers:
 *
 *   - `sdk_client(ctx)` — construct a fully-wired SDK root client that
 *     routes through the CLI's auth/retry/TLS stack.
 *   - `block_on(future)` — run an async SDK call from synchronous
 *     handler context (bridges `ApiError` → `CliError`).
 *
 * Client names and the sub-client tree are derived from the Fern IR
 * using the same de-confliction logic as the Rust SDK generator
 * (`SymbolRegistry` with numbered-suffix strategy + `CaseConverter`),
 * so the generated `sdk_glue.rs` is always in sync with the generated
 * SDK — including specs with nested `x-fern-sdk-group-name` groups
 * and de-conflicted client names like `SimpleClient2`, `PoolsClient3`.
 */

import { CaseConverter } from "@fern-api/base-generator";
import { SymbolRegistry } from "@fern-api/core-utils";
import { writeFile } from "fs/promises";
import path from "path";

import type { SdkGlueIrInfo } from "./ir.js";

/** A sub-client field (possibly nested). */
export interface SubClientField {
    fieldName: string;
    typeName: string;
}

/** Recursive tree of client fields derived from the IR. */
interface ClientNode {
    fieldName: string;
    typeName: string;
    /** Module path segments relative to `api::resources` (e.g. `["agents"]`). */
    modulePath: string[];
    children: ClientNode[];
}

/** Root client info derived from the IR. */
export interface RootClientInfo {
    name: string;
    subClients: ClientNode[];
    hasHttpClient: boolean;
}

// ---------------------------------------------------------------------------
// IR-based client tree resolution
// ---------------------------------------------------------------------------

/**
 * Build a client name registry that mirrors the Rust SDK generator's
 * `AbstractRustGeneratorContext.registerAllFilenames()` — Priority 4.
 *
 * Registration order:
 *   1. Root client (id "root")
 *   2. All subpackages in `Object.entries(ir.subpackages)` iteration order
 *
 * The `SymbolRegistry` with `numbered-suffix` strategy appends `2`, `3`, …
 * when base names collide (e.g. `SimpleClient` → `SimpleClient2`).
 */
function buildClientNameRegistry(caseConverter: CaseConverter, irInfo: SdkGlueIrInfo): SymbolRegistry {
    const registry = new SymbolRegistry({
        reservedSymbolNames: [],
        conflictResolutionStrategy: "numbered-suffix"
    });

    // Register root client first (matches Rust SDK generator order).
    const rootClientName = `${caseConverter.pascalSafe(irInfo.apiName)}Client`;
    registry.registerSymbol("root", [rootClientName]);

    // Register ALL subpackage clients in Object.entries() insertion order — this
    // matches the Rust SDK generator's registerAllFilenames() (Priority 4) at
    // AbstractRustGeneratorContext.ts:824, which also iterates Object.entries(ir.subpackages).
    // Both parse the same serialized IR JSON, so insertion order is deterministic.
    for (const [subpackageId, subpackage] of Object.entries(irInfo.subpackages)) {
        const baseClientName = `${caseConverter.pascalSafe(subpackage.name)}Client`;
        registry.registerSymbol(subpackageId, [baseClientName]);
    }

    return registry;
}

/**
 * Build the recursive client tree for a package's direct sub-clients.
 *
 * Mirrors `ClientGeneratorContext.getSubClients()` from the Rust SDK
 * generator: only subpackages with `service != null || hasEndpointsInTree`
 * become struct fields.
 */
function buildClientTree(
    caseConverter: CaseConverter,
    registry: SymbolRegistry,
    irInfo: SdkGlueIrInfo,
    subpackageIds: string[],
    parentModulePath: string[]
): ClientNode[] {
    const nodes: ClientNode[] = [];

    for (const subpackageId of subpackageIds) {
        const subpackage = irInfo.subpackages[subpackageId];
        if (subpackage == null) {
            continue;
        }

        // Only include subpackages that contribute client struct fields
        // (matches ClientGeneratorContext.getSubClients() filter).
        if (subpackage.service == null && !subpackage.hasEndpointsInTree) {
            continue;
        }

        const fieldName = caseConverter.snakeSafe(subpackage.name);
        const typeName = registry.getSymbolNameByIdOrThrow(subpackageId);
        const modulePath = [...parentModulePath, fieldName];

        const children = buildClientTree(caseConverter, registry, irInfo, subpackage.subpackages, modulePath);

        nodes.push({ fieldName, typeName, modulePath, children });
    }

    return nodes;
}

/**
 * Resolve the full client tree from the IR, using the same
 * de-confliction logic as the Rust SDK generator.
 */
export function resolveClientTreeFromIr(irInfo: SdkGlueIrInfo): RootClientInfo {
    const caseConverter = new CaseConverter({
        generationLanguage: "rust",
        keywords: irInfo.casingsConfig?.keywords,
        smartCasing: irInfo.casingsConfig?.smartCasing ?? true
    });

    const registry = buildClientNameRegistry(caseConverter, irInfo);

    const rootClientName = registry.getSymbolNameByIdOrThrow("root");
    const subClients = buildClientTree(caseConverter, registry, irInfo, irInfo.rootPackage.subpackages, []);

    // The root struct has an `http_client` field when the root package
    // itself has a service (i.e., root-level endpoints exist alongside
    // sub-client groups).
    const hasHttpClient = irInfo.rootPackage.service != null;

    return { name: rootClientName, subClients, hasHttpClient };
}

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

/**
 * Render the Rust struct literal for a single client node, recursing into
 * children.  Returns a multi-line string like:
 *
 *     sdk::api::AgentsClient {
 *         http_client: http_client.clone(),
 *         drive: sdk::api::resources::agents::DriveClient { http_client: http_client.clone() },
 *     }
 */
function renderClientInit(sdkCrate: string, node: ClientNode, indent: string): string {
    const qualifiedType = qualifyType(sdkCrate, node);

    if (node.children.length === 0) {
        return `${qualifiedType} { http_client: http_client.clone() }`;
    }

    const lines: string[] = [];
    lines.push(`${qualifiedType} {`);
    lines.push(`${indent}    http_client: http_client.clone(),`);
    for (const child of node.children) {
        const childInit = renderClientInit(sdkCrate, child, indent + "    ");
        lines.push(`${indent}    ${child.fieldName}: ${childInit},`);
    }
    lines.push(`${indent}}`);
    return lines.join("\n");
}

/**
 * Build the qualified type path for a client node.
 *
 * Top-level sub-clients are re-exported at `sdk::api::TypeName`.
 * Nested sub-clients are NOT re-exported at the `api` root — they live
 * under their group module beneath `api::resources`, i.e.
 * `sdk::api::resources::<parent_modules>::TypeName`. `modulePath` is
 * relative to `api::resources`, so the `resources::` prefix is required.
 */
function qualifyType(sdkCrate: string, node: ClientNode): string {
    if (node.modulePath.length <= 1) {
        return `${sdkCrate}::api::${node.typeName}`;
    }
    // For nested clients, use the parent modules (all but last segment),
    // rooted at `api::resources` where the group modules actually live.
    const parentModules = node.modulePath.slice(0, -1).join("::");
    return `${sdkCrate}::api::resources::${parentModules}::${node.typeName}`;
}

/**
 * Generate the `sdk_glue.rs` module content.
 */
function renderSdkGlue(sdkCrateSnake: string, rootClient: RootClientInfo): string {
    const subClientInits = rootClient.subClients
        .map((node) => {
            const init = renderClientInit(sdkCrateSnake, node, "        ");
            return `        ${node.fieldName}: ${init},`;
        })
        .join("\n");

    // Include http_client when the root struct declares it (flat APIs or
    // APIs with both root-level endpoints and sub-client groups).
    const httpClientInit = rootClient.hasHttpClient ? "\n        http_client: http_client.clone()," : "";

    return `\
//! Generated SDK client glue — bridges AppContext to the co-generated SDK.
//!
//! Auto-generated by @fern-api/cli-generator. Do not edit by hand.

#![allow(dead_code)]

use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;

use fern_cli_sdk::error::CliError;
use fern_cli_sdk::openapi::AppContext;
use fern_cli_sdk::sdk_executor::{CliExecutor, SdkError, SdkRequestExecutor};

// ---------------------------------------------------------------------------
// Executor adapter: CliExecutor → SDK RequestExecutor
// ---------------------------------------------------------------------------

struct CliExecutorAdapter(Arc<CliExecutor>);

impl ${sdkCrateSnake}::RequestExecutor for CliExecutorAdapter {
    fn execute(
        &self,
        request: reqwest::Request,
    ) -> Pin<
        Box<
            dyn Future<Output = Result<reqwest::Response, Box<dyn std::error::Error + Send + Sync>>>
                + Send
                + '_,
        >,
    > {
        Box::pin(async move {
            SdkRequestExecutor::execute(&*self.0, request)
                .await
                .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)
        })
    }
}

// ---------------------------------------------------------------------------
// sdk_client — construct a fully-wired SDK root client
// ---------------------------------------------------------------------------

/// Build the SDK root client from the CLI's runtime context.
///
/// The returned client routes all HTTP through the CLI's executor, so
/// it inherits auth, retries, TLS, and global headers automatically.
pub fn sdk_client(ctx: &AppContext) -> ${sdkCrateSnake}::api::${rootClient.name} {
    let executor = ctx.build_sdk_executor();
    let adapter = Arc::new(CliExecutorAdapter(executor));
    let config = ${sdkCrateSnake}::ClientConfig::default();
    let http_client = ${sdkCrateSnake}::HttpClient::with_executor(
        adapter as Arc<dyn ${sdkCrateSnake}::RequestExecutor>,
        config.clone(),
    );
    ${sdkCrateSnake}::api::${rootClient.name} {
        config,${httpClientInit}
${subClientInits}
    }
}

// ---------------------------------------------------------------------------
// block_on — async SDK call → sync handler result
// ---------------------------------------------------------------------------

/// Execute an async SDK operation from a synchronous custom-command handler.
///
/// Bridges the SDK's \`ApiError\` into the CLI's \`CliError\` so \`?\` works
/// naturally in handler bodies.
pub fn block_on<F, T>(future: F) -> Result<T, CliError>
where
    F: Future<Output = Result<T, ${sdkCrateSnake}::ApiError>>,
{
    tokio::task::block_in_place(|| {
        let handle = tokio::runtime::Handle::current();
        handle.block_on(future).map_err(convert_api_error)
    })
}

fn convert_api_error(e: ${sdkCrateSnake}::ApiError) -> CliError {
    match e {
        ${sdkCrateSnake}::ApiError::Http { status, message } => CliError::Api {
            code: status,
            message,
            reason: http_status_reason(status).to_string(),
        },
        ${sdkCrateSnake}::ApiError::Network(err) => {
            CliError::Other(anyhow::anyhow!("SDK network error: {err}"))
        }
        ${sdkCrateSnake}::ApiError::Executor(boxed) => match boxed.downcast::<SdkError>() {
            Ok(sdk_error) => sdk_error.into_cli_error(),
            Err(other) => CliError::Other(anyhow::anyhow!("SDK executor error: {other}")),
        },
        other => CliError::Other(anyhow::anyhow!("SDK error: {other}")),
    }
}

fn http_status_reason(status: u16) -> &'static str {
    match status {
        400 => "badRequest",
        401 => "unauthorized",
        403 => "forbidden",
        404 => "notFound",
        408 => "requestTimeout",
        409 => "conflict",
        429 => "tooManyRequests",
        500 => "internalServerError",
        502 => "badGateway",
        503 => "serviceUnavailable",
        504 => "gatewayTimeout",
        _ => "httpError",
    }
}
`;
}

/**
 * Generate `cli/<binaryName>/sdk_glue.rs`.
 *
 * Derives the client tree from the IR using the same de-confliction
 * logic as the Rust SDK generator, so client names like `SimpleClient2`
 * and `PoolsClient3` are resolved correctly without regex-parsing
 * generated Rust source files.
 */
export async function generateSdkGlue(args: {
    outputDir: string;
    binaryName: string;
    sdkCrateName: string;
    irInfo: SdkGlueIrInfo;
}): Promise<SubClientField[]> {
    const { outputDir, binaryName, sdkCrateName, irInfo } = args;
    const sdkCrateSnake = sdkCrateName.replace(/-/g, "_");

    const rootClient = resolveClientTreeFromIr(irInfo);

    // Write the glue module.
    const binDir = path.join(outputDir, "cli", binaryName);
    const content = renderSdkGlue(sdkCrateSnake, rootClient);
    await writeFile(path.join(binDir, "sdk_glue.rs"), content);

    // Return flat sub-client list for agent skill generation.
    return flattenSubClients(rootClient.subClients);
}

/** Flatten the recursive tree into a flat list (preserves the public interface). */
function flattenSubClients(nodes: ClientNode[]): SubClientField[] {
    const result: SubClientField[] = [];
    for (const node of nodes) {
        result.push({ fieldName: node.fieldName, typeName: node.typeName });
        result.push(...flattenSubClients(node.children));
    }
    return result;
}
