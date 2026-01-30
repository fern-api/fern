//! Centralized helper functions for WireMock-based wire tests.
//!
//! This module provides utilities for managing WireMock interactions during integration tests.
//!
//! # Running Wire Tests
//!
//! **Recommended**: Use the generated script for automatic lifecycle management:
//! ```bash
//! chmod +x run_wire_tests.sh       # First time only
//! ./run_wire_tests.sh              # Run all wire tests
//! ./run_wire_tests.sh --test foo   # Run specific test
//! ```
//!
//! **Manual**: If running tests directly with cargo:
//! ```bash
//! docker compose -f wiremock/docker-compose.test.yml up -d --wait
//! RUN_WIRE_TESTS=true cargo test -- --test-threads=1
//! docker compose -f wiremock/docker-compose.test.yml down
//! ```
//!
//! This is automatically generated and should not be modified manually.

use reqwest::Client;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::process::Command;
use std::sync::Once;

/// The base URL for WireMock
pub const WIREMOCK_BASE_URL: &str = "http://localhost:8080";
const WIREMOCK_ADMIN_URL: &str = "http://localhost:8080/__admin";
const WIREMOCK_COMPOSE_FILE: &str = "wiremock/docker-compose.test.yml";

static START: Once = Once::new();

/// Check if WireMock is already running by hitting the health endpoint
fn is_wiremock_running() -> bool {
    Command::new("curl")
        .args(["-s", "-f", &format!("{}/__admin/health", WIREMOCK_BASE_URL)])
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

/// Called automatically when test binary loads.
/// Starts the WireMock container if RUN_WIRE_TESTS=true and not already running.
#[ctor::ctor]
fn start_wiremock() {
    if std::env::var("RUN_WIRE_TESTS").as_deref() == Ok("true") {
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
        .delete(format!("{}/requests", WIREMOCK_ADMIN_URL))
        .send()
        .await?;
    Ok(())
}

/// Verifies the number of requests made to WireMock for a specific endpoint.
///
/// # Arguments
/// * `method` - The HTTP method (GET, POST, etc.)
/// * `url_path` - The URL path to match
/// * `query_params` - Optional query parameters to match
/// * `expected` - Expected number of requests
///
/// # Returns
/// Returns Ok(()) if the expected count matches, or panics with an assertion error.
pub async fn verify_request_count(
    method: &str,
    url_path: &str,
    query_params: Option<HashMap<String, String>>,
    expected: usize,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut request_body = json!({
        "method": method,
        "urlPath": url_path,
    });

    if let Some(params) = query_params {
        let query_parameters: Value = params
            .into_iter()
            .map(|(k, v)| (k, json!({"equalTo": v})))
            .collect();
        request_body["queryParameters"] = query_parameters;
    }

    let response = Client::new()
        .post(format!("{}/requests/find", WIREMOCK_ADMIN_URL))
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
