/**
 * Generate `cli/<binaryName>/sdk.rs` — the adapter that bridges the
 * CLI's runtime (`AppContext`, `CliExecutor`) to the co-generated SDK
 * crate's typed client.
 *
 * Provides two public helpers for custom command handlers:
 *
 *   - `client(ctx)` — construct a fully-wired SDK root client that
 *     routes through the CLI's auth/retry/TLS stack.
 *   - `block_on(future)` — run an async SDK call from synchronous
 *     handler context (bridges `ApiError` → `CliError`).
 *
 * Client names and the sub-client tree are read directly from the Rust
 * SDK generator's `SdkGeneratorContext` — the authoritative source for
 * de-conflicted names (including `SimpleClient2`, `PoolsClient3`).
 * No independent re-derivation: zero drift possible.
 */

import { SdkGeneratorContext } from "@fern-api/rust-sdk";
import { writeFile } from "fs/promises";
import path from "path";

/** A sub-client field (possibly nested). */
export interface SubClientField {
    fieldName: string;
    typeName: string;
}

/** Recursive tree of client fields derived from the SDK context. */
interface ClientNode {
    fieldName: string;
    typeName: string;
    /** Module path segments relative to `api::resources` (e.g. `["agents"]`). */
    modulePath: string[];
    children: ClientNode[];
}

/** Root client info read from the SDK generator context. */
export interface RootClientInfo {
    name: string;
    subClients: ClientNode[];
    hasHttpClient: boolean;
}

// ---------------------------------------------------------------------------
// Context-based client tree resolution
// ---------------------------------------------------------------------------

/**
 * Build the recursive client tree by reading directly from the Rust
 * SDK generator context. Names are authoritative — they come from the
 * same `RustFilenameRegistry` that produced the generated SDK crate.
 */
function buildClientTreeFromContext(
    context: SdkGeneratorContext,
    subpackageIds: string[],
    parentModulePath: string[]
): ClientNode[] {
    const nodes: ClientNode[] = [];

    for (const subpackageId of subpackageIds) {
        const subpackage = context.getSubpackageOrThrow(subpackageId);

        // Only include subpackages that contribute client struct fields
        // (matches ClientGeneratorContext.getSubClients() filter).
        if (subpackage.service == null && !subpackage.hasEndpointsInTree) {
            continue;
        }

        const fieldName = context.case.snakeSafe(subpackage.name);
        const typeName = context.getUniqueClientNameForSubpackage(subpackage);
        const modulePath = [...parentModulePath, fieldName];

        const children = buildClientTreeFromContext(context, subpackage.subpackages, modulePath);

        nodes.push({ fieldName, typeName, modulePath, children });
    }

    return nodes;
}

/**
 * Resolve the full client tree from the SDK generator context.
 * All names are authoritative — read directly from the Rust SDK
 * generator's filename registry.
 */
export function resolveClientTreeFromContext(context: SdkGeneratorContext): RootClientInfo {
    const rootClientName = context.getClientName();
    const subClients = buildClientTreeFromContext(context, context.ir.rootPackage.subpackages, []);

    // The root struct has an `http_client` field when the root package
    // itself has a service (i.e., root-level endpoints exist alongside
    // sub-client groups).
    const hasHttpClient = context.ir.rootPackage.service != null;

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
 * Generate the `sdk.rs` module content.
 */
function renderSdk(sdkCrateSnake: string, rootClient: RootClientInfo): string {
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
//! Generated SDK client adapter — bridges AppContext to the co-generated SDK.
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
// client — construct a fully-wired SDK root client
// ---------------------------------------------------------------------------

/// Build the SDK root client from the CLI's runtime context.
///
/// The returned client routes all HTTP through the CLI's executor, so
/// it inherits auth, retries, TLS, and global headers automatically.
pub fn client(ctx: &AppContext) -> ${sdkCrateSnake}::api::${rootClient.name} {
    let executor = ctx.build_sdk_executor();
    let adapter = Arc::new(CliExecutorAdapter(executor));
    // Seed the base URL from the CLI's own resolution (--base-url / env >
    // spec base_url > server root). \`ClientConfig::default()\` carries an
    // empty \`base_url\` for any API that declares no environment, which made
    // every custom command fail on a relative URL before the executor ran.
    let config = ${sdkCrateSnake}::ClientConfig {
        base_url: ctx.effective_base_url(),
        ..Default::default()
    };
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
        ${sdkCrateSnake}::ApiError::Http { status, message } => {
            fern_cli_sdk::error::api_error_from_body(status, &message)
        }
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
`;
}

/**
 * Generate `cli/<binaryName>/sdk.rs`.
 *
 * Reads client names directly from the Rust SDK generator context —
 * the single authoritative source for de-conflicted names. No
 * independent re-derivation, no drift.
 */
export async function generateSdk(args: {
    outputDir: string;
    binaryName: string;
    sdkCrateName: string;
    sdkContext: SdkGeneratorContext;
}): Promise<SubClientField[]> {
    const { outputDir, binaryName, sdkCrateName, sdkContext } = args;
    const sdkCrateSnake = sdkCrateName.replace(/-/g, "_");

    const rootClient = resolveClientTreeFromContext(sdkContext);

    // Write the sdk module.
    const binDir = path.join(outputDir, "cli", binaryName);
    const content = renderSdk(sdkCrateSnake, rootClient);
    await writeFile(path.join(binDir, "sdk.rs"), content);

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
