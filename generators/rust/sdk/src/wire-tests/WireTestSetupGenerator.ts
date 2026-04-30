import { FernIr } from "@fern-fern/ir-sdk";
import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { isEqualToMatcher, WireMock, WireMockMapping, WireMockStubMapping } from "@fern-api/mock-utils";
import { RustFile } from "@fern-api/rust-base";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

/**
 * Generates setup files for wire testing, specifically docker-compose configuration
 * to spin up WireMock for testing against.
 */
export class WireTestSetupGenerator {
    private readonly context: SdkGeneratorContext;
    private readonly ir: FernIr.IntermediateRepresentation;

    constructor(context: SdkGeneratorContext, ir: FernIr.IntermediateRepresentation) {
        this.context = context;
        this.ir = ir;
    }

    /**
     * Generates docker-compose.test.yml file to spin up WireMock as a docker container
     * and wire_test_utils.rs for centralized helper functions
     */
    public generate(): void {
        this.generateWireMockConfigFile();
        this.generateDockerComposeFile();
        this.generateWireTestUtils();
        this.generateWireTestScript();
    }

    public static getWiremockConfigContent(ir: FernIr.IntermediateRepresentation) {
        // @ts-expect-error Nominal type mismatch: Rust SDK uses ir-sdk@66.2.0 while mock-utils
        // resolves to a different version. The types are structurally compatible at runtime.
        return new WireMock().convertToWireMock(ir);
    }

    private generateWireMockConfigFile(): void {
        const wireMockConfigContent = WireTestSetupGenerator.getWiremockConfigContent(this.ir);

        // Post-process mappings to fix unit type responses
        this.fixUnitTypeResponses(wireMockConfigContent);

        // Post-process mappings to strip milliseconds from datetime strings.
        // The Rust SDK serializes datetimes using chrono's SecondsFormat::Secs,
        // which produces "2024-01-15T09:30:00Z" (no milliseconds), but
        // mock-utils' toISOString() produces "2024-01-15T09:30:00.000Z".
        this.stripDatetimeMilliseconds(wireMockConfigContent);

        // Add fallback mappings for bytes endpoints. mock-utils skips bytes
        // endpoints entirely, but the SDK generates tests for them. Add a
        // low-priority mapping (without query params) for each bytes endpoint
        // by copying the response from a sibling endpoint at the same path.
        this.addBytesEndpointFallbackMappings(wireMockConfigContent);

        const wireMockConfigFile = new File(
            "wiremock-mappings.json",
            RelativeFilePath.of("wiremock"),
            JSON.stringify(wireMockConfigContent, null, 2)
        );
        this.context.project.addRawFiles(wireMockConfigFile);
        this.context.logger.debug("Generated wiremock-mappings.json for WireMock");
    }

    /**
     * Fix unit type responses in WireMock mappings.
     * Rust's unit type () should serialize as null, not empty string.
     */
    private fixUnitTypeResponses(wireMockConfig: WireMockStubMapping): void {
        // Build a map of endpoint IDs to their response types
        const endpointResponseTypes = new Map<string, boolean>();

        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                const isUnitType = this.isUnitTypeResponse(endpoint);
                endpointResponseTypes.set(endpoint.id, isUnitType);
            }
        }

        // Fix the response bodies for unit type endpoints
        for (const mapping of wireMockConfig.mappings || []) {
            // Extract endpoint ID from mapping name or match by URL
            const endpointId = this.findEndpointIdForMapping(mapping);
            if (endpointId && endpointResponseTypes.get(endpointId)) {
                // Replace empty string with null for unit types
                if (mapping.response.body === '""') {
                    mapping.response.body = "null";
                }
            }
        }
    }

    /**
     * Check if an endpoint returns a unit type ()
     */
    private isUnitTypeResponse(endpoint: FernIr.HttpEndpoint): boolean {
        // If there's no response field at all, it's not a unit type endpoint
        if (!endpoint.response) {
            return false;
        }

        // Access the response type - need to cast because the exact structure isn't in the public API
        const responseType = (endpoint.response as { type?: unknown }).type;

        // No response type means it returns unit/void
        if (!responseType) {
            return true;
        }

        // Check if response type is explicitly void
        const responseTypeObj = responseType as { _type?: string; value?: unknown };
        if (responseTypeObj._type === "void") {
            return true;
        }

        // If it's a JSON response with no value, it's a unit type
        if (responseTypeObj._type === "json" && !responseTypeObj.value) {
            return true;
        }

        return false;
    }

    /**
     * Find the endpoint ID that corresponds to a WireMock mapping
     */
    private findEndpointIdForMapping(mapping: WireMockMapping): string | undefined {
        const urlPath = mapping.request.urlPathTemplate;
        const method = mapping.request.method;

        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                const endpointPath = this.buildEndpointPath(endpoint);
                if (endpointPath === urlPath && endpoint.method === method) {
                    return endpoint.id;
                }
            }
        }

        return undefined;
    }

    /**
     * Build the URL path for an endpoint to match against WireMock mappings
     */
    private buildEndpointPath(endpoint: FernIr.HttpEndpoint): string {
        let path = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts || []) {
            path += `{${part.pathParameter}}${part.tail}`;
        }
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return path;
    }

    private static readonly DATETIME_WITH_ZERO_MILLIS_REGEX =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000(Z|[+-]\d{2}:\d{2})$/;

    /**
     * Strip .000 milliseconds from datetime strings in WireMock mappings.
     * Rust's chrono serializes with SecondsFormat::Secs (no milliseconds),
     * but JS Date.toISOString() always includes .000.
     */
    private stripDatetimeMilliseconds(wireMockConfig: WireMockStubMapping): void {
        for (const mapping of wireMockConfig.mappings || []) {
            // Strip from query parameter matchers
            if (mapping.request.queryParameters) {
                for (const [_key, matcher] of Object.entries(mapping.request.queryParameters)) {
                    if (!isEqualToMatcher(matcher)) {
                        continue;
                    }
                    if (WireTestSetupGenerator.DATETIME_WITH_ZERO_MILLIS_REGEX.test(matcher.equalTo)) {
                        matcher.equalTo = matcher.equalTo.replace(".000", "");
                    }
                }
            }
            // Strip from response body
            if (typeof mapping.response.body === "string") {
                mapping.response.body = mapping.response.body.replace(
                    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.000(Z|[+-]\d{2}:\d{2})/g,
                    "$1$2"
                );
            }
        }
    }

    /**
     * Add fallback WireMock mappings for bytes endpoints.
     *
     * mock-utils skips endpoints with requestBody.type === "bytes" so they get
     * no mapping. When a bytes endpoint shares a URL path with another endpoint
     * (e.g. transcribe_file and transcribe_url both at POST /v1/listen), the
     * bytes endpoint's test fails because the only mapping requires specific
     * query parameters that the bytes test doesn't send.
     *
     * This method finds bytes endpoints, locates an existing sibling mapping
     * at the same method+path, and adds a low-priority copy without query
     * parameters so the bytes endpoint test can match.
     */
    private addBytesEndpointFallbackMappings(wireMockConfig: WireMockStubMapping): void {
        // Collect bytes endpoints that need fallback mappings
        const bytesEndpoints: Array<{ method: string; path: string }> = [];
        for (const service of Object.values(this.ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody?.type === "bytes") {
                    const path = this.buildEndpointPath(endpoint);
                    bytesEndpoints.push({ method: endpoint.method, path });
                }
            }
        }

        if (bytesEndpoints.length === 0) {
            return;
        }

        // Index existing mappings by method+path
        const existingByKey = new Map<string, WireMockMapping>();
        for (const mapping of wireMockConfig.mappings || []) {
            const key = `${mapping.request.method}:${mapping.request.urlPathTemplate}`;
            // Keep the first (highest-priority) mapping for each key
            if (!existingByKey.has(key)) {
                existingByKey.set(key, mapping);
            }
        }

        // Add fallback for each bytes endpoint
        for (const { method, path } of bytesEndpoints) {
            const key = `${method}:${path}`;
            const sibling = existingByKey.get(key);
            if (sibling) {
                // Clone the sibling but strip query parameters and set lower priority
                const fallback: WireMockMapping = {
                    ...sibling,
                    id: `${sibling.id.slice(0, -4)}fb00`,
                    name: `${sibling.name} (bytes fallback)`,
                    uuid: `${sibling.uuid.slice(0, -4)}fb00`,
                    priority: 5,
                    request: {
                        method: sibling.request.method,
                        urlPathTemplate: sibling.request.urlPathTemplate
                        // No queryParameters — matches any request to this path
                    },
                    response: { ...sibling.response }
                };
                wireMockConfig.mappings.push(fallback);
            }
        }
    }

    /**
     * Generates a docker-compose.test.yml file for spinning up WireMock
     * for wire test execution.
     */
    private generateDockerComposeFile(): void {
        const dockerComposeContent = this.buildDockerComposeContent();
        const dockerComposeFile = new File(
            "docker-compose.test.yml",
            RelativeFilePath.of("./wiremock"),
            dockerComposeContent
        );

        this.context.project.addRawFiles(dockerComposeFile);
        this.context.logger.debug("Generated docker-compose.test.yml for WireMock container");
    }

    /**
     * Builds the content for the docker-compose.test.yml file
     */
    private buildDockerComposeContent(): string {
        return `services:
  wiremock:
    image: wiremock/wiremock:3.9.1
    ports:
      - "0:8080"  # Use dynamic port to avoid conflicts with concurrent tests
    volumes:
      - ./wiremock-mappings.json:/home/wiremock/mappings/wiremock-mappings.json
    command: ["--global-response-templating", "--verbose"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/__admin/health"]
      interval: 2s
      timeout: 5s
      retries: 15
      start_period: 5s
`;
    }

    /**
     * Generates wire_test_utils.rs - centralized helper functions for wire tests.
     * This is similar to Ruby's wire_helper.rb pattern.
     */
    private generateWireTestUtils(): void {
        const wireTestUtilsContent = this.buildWireTestUtilsContent();
        const wireTestUtilsFile = new RustFile({
            filename: "wire_test_utils.rs",
            directory: RelativeFilePath.of("tests"),
            fileContents: wireTestUtilsContent
        });

        this.context.project.addSourceFiles(wireTestUtilsFile);
        this.context.logger.debug("Generated wire_test_utils.rs for centralized wire test helpers");
    }

    /**
     * Generates run_wire_tests.sh - a shell script that handles the full test lifecycle:
     * 1. Starts WireMock container
     * 2. Runs cargo test with RUN_WIRE_TESTS=true
     * 3. Stops WireMock container (always, even if tests fail)
     */
    private generateWireTestScript(): void {
        const scriptContent = this.buildWireTestScriptContent();
        const scriptFile = new File("run_wire_tests.sh", RelativeFilePath.of("./"), scriptContent);
        this.context.project.addRawFiles(scriptFile);
        this.context.logger.debug("Generated run_wire_tests.sh for wire test lifecycle management");
    }

    /**
     * Builds the content for run_wire_tests.sh
     */
    private buildWireTestScriptContent(): string {
        return `#!/bin/bash
# Wire Test Runner
# This script handles the full lifecycle of wire tests:
# 1. Starts WireMock container (if not already running)
# 2. Runs cargo test with RUN_WIRE_TESTS=true
# 3. Stops WireMock container after tests complete
#
# First time setup: chmod +x run_wire_tests.sh
#
# Usage: ./run_wire_tests.sh [cargo test args...]
#    or: bash run_wire_tests.sh [cargo test args...]
#
# Example: ./run_wire_tests.sh --test imdb_test
# Example: ./run_wire_tests.sh -- --nocapture

set -e

COMPOSE_FILE="wiremock/docker-compose.test.yml"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

echo -e "\${YELLOW}Starting WireMock container...\${NC}"
docker compose -f "\$COMPOSE_FILE" up -d --wait

# Ensure cleanup happens even if tests fail
cleanup() {
    echo -e "\${YELLOW}Stopping WireMock container...\${NC}"
    docker compose -f "\$COMPOSE_FILE" down
}
trap cleanup EXIT

echo -e "\${GREEN}Running wire tests...\${NC}"
RUN_WIRE_TESTS=true cargo test -- --test-threads=1 "$@"

echo -e "\${GREEN}Wire tests completed!\${NC}"
`;
    }

    /**
     * Builds the content for wire_test_utils.rs - centralized helper module.
     * Contains lifecycle management (start/stop WireMock) and helper functions.
     * This is the Rust equivalent of Ruby's wire_helper.rb pattern.
     *
     * Note: The setup is idempotent - it only starts the container if not already running,
     * and doesn't stop it automatically (since cargo test runs each test file as a separate binary).
     * Users can manually stop with: docker compose -f wiremock/docker-compose.test.yml down
     */
    private buildWireTestUtilsContent(): string {
        return `//! Centralized helper functions for WireMock-based wire tests.
//!
//! This module provides utilities for managing WireMock interactions during integration tests.
//!
//! # Running Wire Tests
//!
//! **Recommended**: Use the generated script for automatic lifecycle management:
//! \`\`\`bash
//! chmod +x run_wire_tests.sh       # First time only
//! ./run_wire_tests.sh              # Run all wire tests
//! ./run_wire_tests.sh --test foo   # Run specific test
//! \`\`\`
//!
//! **Manual**: If running tests directly with cargo:
//! \`\`\`bash
//! docker compose -f wiremock/docker-compose.test.yml up -d --wait
//! RUN_WIRE_TESTS=true cargo test -- --test-threads=1
//! docker compose -f wiremock/docker-compose.test.yml down
//! \`\`\`
//!
//! This is automatically generated and should not be modified manually.

use reqwest::Client;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::process::Command;
use std::sync::Once;

/// The base URL for WireMock
pub fn get_wiremock_base_url() -> String {
    std::env::var("WIREMOCK_URL").unwrap_or_else(|_| "http://localhost:8080".to_string())
}

fn get_wiremock_admin_url() -> String {
    format!("{}/\_\_admin", get_wiremock_base_url())
}
const WIREMOCK_COMPOSE_FILE: &str = "wiremock/docker-compose.test.yml";

static START: Once = Once::new();

/// Check if WireMock is already running by hitting the health endpoint
fn is_wiremock_running() -> bool {
    Command::new("curl")
        .args(["-s", "-f", &format!("{}/health", get_wiremock_admin_url())])
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

/// Called automatically when test binary loads.
/// Starts the WireMock container if RUN_WIRE_TESTS=true and WIREMOCK_URL is not already set.
#[ctor::ctor]
fn start_wiremock() {
    if std::env::var("RUN_WIRE_TESTS").as_deref() == Ok("true") {
        // If WIREMOCK_URL is already set (external orchestration), skip container management
        if std::env::var("WIREMOCK_URL").is_ok() {
            return;
        }

        START.call_once(|| {
            // Check if docker-compose file exists
            if !std::path::Path::new(WIREMOCK_COMPOSE_FILE).exists() {
                return;
            }

            // Check if WireMock is already running (idempotent setup)
            if is_wiremock_running() {
                return;
            }

            println!("Starting WireMock container...");

            // Start the container and wait for it to be healthy
            let status = Command::new("docker")
                .args(["compose", "-f", WIREMOCK_COMPOSE_FILE, "up", "-d", "--wait"])
                .status();

            if let Err(e) = status {
                eprintln!("Failed to start WireMock container: {}", e);
                return;
            }

            // Discover the dynamically assigned port and set WIREMOCK_URL
            let port_output = Command::new("docker")
                .args(["compose", "-f", WIREMOCK_COMPOSE_FILE, "port", "wiremock", "8080"])
                .output();

            if let Ok(output) = port_output {
                let port_str = String::from_utf8_lossy(&output.stdout);
                let port_str = port_str.trim();
                if let Some(port) = port_str.split(':').last() {
                    let url = format!("http://localhost:{}", port.trim());
                    // Set the env var so get_wiremock_base_url() picks it up
                    std::env::set_var("WIREMOCK_URL", &url);
                    println!("WireMock container is ready at {}", url);
                }
            }
        });
    }
}

// Note: We intentionally do NOT stop WireMock automatically.
// Since cargo test runs each test file as a separate binary, stopping on each
// binary exit would cause constant start/stop cycles.
// Users can manually stop with: docker compose -f wiremock/docker-compose.test.yml down

/// Resets all WireMock request journal entries.
///
/// Call this at the beginning of each test to ensure a clean state.
///
/// # Returns
/// Returns Ok(()) on success, or an error if the reset fails.
pub async fn reset_wiremock_requests() -> Result<(), Box<dyn std::error::Error>> {
    Client::new()
        .delete(format!("{}/requests", get_wiremock_admin_url()))
        .send()
        .await?;
    Ok(())
}

/// Verifies the number of requests made to WireMock for a specific endpoint.
///
/// # Arguments
/// * \`method\` - The HTTP method (GET, POST, etc.)
/// * \`url_path\` - The URL path to match
/// * \`query_params\` - Optional query parameters to match
/// * \`expected\` - Expected number of requests
///
/// # Returns
/// Returns Ok(()) if the expected count matches, or panics with an assertion error.
pub async fn verify_request_count(
    method: &str,
    url_path: &str,
    query_params: Option<HashMap<String, serde_json::Value>>,
    expected: usize,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut request_body = json!({
        "method": method,
        "urlPath": url_path,
    });

    if let Some(params) = query_params {
        let query_parameters: Value = params
            .into_iter()
            .map(|(k, v)| {
                let matcher = if v.is_array() {
                    let items: Vec<Value> = v.as_array().unwrap()
                        .iter()
                        .filter_map(|item| item.as_str())
                        .map(|s| json!({"equalTo": s}))
                        .collect();
                    json!({"hasExactly": items})
                } else if let Some(s) = v.as_str() {
                    json!({"equalTo": s})
                } else {
                    json!({"equalTo": v.to_string()})
                };
                (k, matcher)
            })
            .collect();
        request_body["queryParameters"] = query_parameters;
    }

    let response = Client::new()
        .post(format!("{}/requests/find", get_wiremock_admin_url()))
        .json(&request_body)
        .send()
        .await?;

    let result: Value = response.json().await?;
    let requests = result["requests"]
        .as_array()
        .ok_or("Invalid response from WireMock")?;

    assert_eq!(
        requests.len(),
        expected,
        "Expected {} requests, found {}",
        expected,
        requests.len()
    );

    Ok(())
}
`;
    }
}
