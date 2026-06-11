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
 * The generated code reads the SDK crate's `src/api/resources/` tree
 * to discover client structs and their sub-client fields recursively,
 * so the construction code is always in sync with the generated SDK —
 * including specs with nested `x-fern-sdk-group-name` groups.
 */

import { readFile, writeFile } from "fs/promises";
import path from "path";

/** A sub-client field parsed from a client struct (possibly nested). */
export interface SubClientField {
    fieldName: string;
    typeName: string;
}

/** Recursive tree of client fields discovered from the generated SDK. */
interface ClientNode {
    fieldName: string;
    typeName: string;
    /** Module path segments relative to `api::resources` (e.g. `["agents"]`). */
    modulePath: string[];
    children: ClientNode[];
}

/** Root client info parsed from the generated SDK. */
export interface RootClientInfo {
    name: string;
    subClients: ClientNode[];
    hasHttpClient: boolean;
}

// ---------------------------------------------------------------------------
// Struct parsing
// ---------------------------------------------------------------------------

/** Fields that are not sub-clients — skip these when discovering sub-clients. */
const SKIP_TYPES = new Set(["ClientConfig", "HttpClient"]);

/**
 * Parse a client struct from Rust source to extract its typed fields.
 *
 * Returns the struct name and all `pub <field>: <Type>` entries,
 * filtering out config/http_client infrastructure fields.
 */
function parseClientStruct(source: string): { name: string; fields: SubClientField[]; hasHttpClient: boolean } | undefined {
    const structMatch = source.match(/pub struct (\w+Client)\s*\{([^}]+)\}/);
    if (structMatch == null) {
        return undefined;
    }

    const name = structMatch[1] ?? "";
    const body = structMatch[2] ?? "";
    const fields: SubClientField[] = [];
    let hasHttpClient = false;

    const fieldRegex = /pub\s+(\w+)\s*:\s*(\w+)\s*,?/g;
    let match;
    while ((match = fieldRegex.exec(body)) !== null) {
        const fieldName = match[1] ?? "";
        const typeName = match[2] ?? "";
        if (typeName === "HttpClient") {
            hasHttpClient = true;
            continue;
        }
        if (SKIP_TYPES.has(typeName)) {
            continue;
        }
        fields.push({ fieldName, typeName });
    }

    return { name, fields, hasHttpClient };
}

/**
 * Recursively discover the client tree starting from `resources/mod.rs`.
 *
 * For each sub-client field, attempts to read
 * `resources/<fieldName>/mod.rs` to discover nested sub-clients.
 * Leaf clients (no sub-directory or no nested struct) have empty children.
 */
async function discoverClientTree(
    resourcesDir: string,
    fields: SubClientField[],
    parentModulePath: string[]
): Promise<ClientNode[]> {
    const nodes: ClientNode[] = [];

    for (const { fieldName, typeName } of fields) {
        const modulePath = [...parentModulePath, fieldName];
        let children: ClientNode[] = [];

        // Try to read the sub-client's mod.rs for nested sub-clients.
        const subModRsPath = path.join(resourcesDir, fieldName, "mod.rs");
        try {
            const subModRs = await readFile(subModRsPath, "utf-8");
            const subStruct = parseClientStruct(subModRs);
            if (subStruct != null && subStruct.fields.length > 0) {
                children = await discoverClientTree(path.join(resourcesDir, fieldName), subStruct.fields, modulePath);
            }
        } catch (_e: unknown) {
            // No sub-directory — leaf client.
        }

        nodes.push({ fieldName, typeName, modulePath, children });
    }

    return nodes;
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

    // When the root struct owns http_client directly (flat APIs with no
    // sub-client groups), we must populate it in the initializer.
    const httpClientInit =
        rootClient.subClients.length === 0 && rootClient.hasHttpClient
            ? "\n        http_client: http_client.clone(),"
            : "";

    return `\
//! Generated SDK client glue — bridges AppContext to the co-generated SDK.
//!
//! Auto-generated by @fern-api/cli-generator. Do not edit by hand.

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
 * Must be called AFTER `generateEmbeddedSdk` so the SDK crate's source
 * files are on disk.
 */
export async function generateSdkGlue(args: {
    outputDir: string;
    binaryName: string;
    sdkCrateName: string;
}): Promise<SubClientField[]> {
    const { outputDir, binaryName, sdkCrateName } = args;
    const sdkCrateSnake = sdkCrateName.replace(/-/g, "_");

    // Read the SDK's root client definition.
    const resourcesDir = path.join(outputDir, sdkCrateName, "src", "api", "resources");
    const modRsPath = path.join(resourcesDir, "mod.rs");
    const modRsContent = await readFile(modRsPath, "utf-8");
    const rootStruct = parseClientStruct(modRsContent);
    if (rootStruct == null) {
        throw new Error("Could not find root client struct in SDK's api/resources/mod.rs");
    }

    // Recursively discover nested sub-clients from the SDK's resource tree.
    const subClients = await discoverClientTree(resourcesDir, rootStruct.fields, []);
    const rootClient: RootClientInfo = { name: rootStruct.name, subClients, hasHttpClient: rootStruct.hasHttpClient };

    // Write the glue module.
    const binDir = path.join(outputDir, "cli", binaryName);
    const content = renderSdkGlue(sdkCrateSnake, rootClient);
    await writeFile(path.join(binDir, "sdk_glue.rs"), content);

    // Return flat sub-client list for agent skill generation.
    return flattenSubClients(subClients);
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
