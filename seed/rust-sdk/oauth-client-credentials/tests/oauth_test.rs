//! OAuth Wire Tests
//!
//! These tests verify the OAuth token flow works correctly with a mock server.
//! They test:
//! - Token is fetched automatically when making API requests
//! - Token is cached and reused for subsequent requests
//! - Authorization header is set correctly with Bearer token

use seed_oauth_client_credentials::prelude::*;
use std::sync::Arc;

mod wire_test_utils;

/// Test that the client fetches an OAuth token and uses it for API requests.
///
/// This test verifies:
/// 1. When making an API request with OAuth credentials, the client fetches a token
/// 2. The token is used in the Authorization header for the API request
#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_oauth_token_fetch_and_use() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::WIREMOCK_BASE_URL;

    // Create OAuth token provider
    let token_provider = Arc::new(OAuthTokenProvider::new(
        "test_client_id".to_string(),
        "test_client_secret".to_string(),
    ));

    // Create OAuth config pointing to the mock token endpoint
    let oauth_config = OAuthConfig {
        token_provider: token_provider.clone(),
        token_endpoint: "/token".to_string(),
    };

    // Create client config with OAuth
    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();

    // Create HTTP client with OAuth support
    let http_client = HttpClient::new_with_oauth(config.clone(), Some(oauth_config))
        .expect("Failed to create HTTP client");

    // Make a request - this should trigger OAuth token fetch
    let result: Result<(), ApiError> = http_client
        .execute_request(
            reqwest::Method::GET,
            "/get-something",
            None,
            None,
            None,
        )
        .await;

    assert!(result.is_ok(), "API request should succeed: {:?}", result.err());

    // Verify token endpoint was called
    wire_test_utils::verify_request_count("POST", "/token", None, 1)
        .await
        .unwrap();

    // Verify the API endpoint was called
    wire_test_utils::verify_request_count("GET", "/get-something", None, 1)
        .await
        .unwrap();

    // Verify the Authorization header was set correctly
    let api_requests = wire_test_utils::get_captured_requests("GET", "/get-something")
        .await
        .unwrap();
    
    assert!(!api_requests.is_empty(), "Should have captured API request");
    
    // WireMock stores headers in a nested structure
    let headers = &api_requests[0]["headers"];
    let auth_header = headers["Authorization"]
        .as_str()
        .or_else(|| headers["authorization"].as_str());
    
    assert!(
        auth_header.is_some(),
        "Authorization header should be present. Headers: {:?}",
        headers
    );
    assert!(
        auth_header.unwrap().contains("Bearer"),
        "Authorization header should contain Bearer token"
    );
}

/// Test that OAuth tokens are cached and reused.
///
/// This test verifies:
/// 1. First request fetches a new token
/// 2. Second request reuses the cached token (no new token fetch)
#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_oauth_token_caching() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::WIREMOCK_BASE_URL;

    // Create OAuth token provider
    let token_provider = Arc::new(OAuthTokenProvider::new(
        "test_client_id".to_string(),
        "test_client_secret".to_string(),
    ));

    // Create OAuth config
    let oauth_config = OAuthConfig {
        token_provider: token_provider.clone(),
        token_endpoint: "/token".to_string(),
    };

    // Create client config with OAuth
    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();

    // Create HTTP client with OAuth support
    let http_client = HttpClient::new_with_oauth(config.clone(), Some(oauth_config))
        .expect("Failed to create HTTP client");

    // Make first request - should fetch token
    let result1: Result<(), ApiError> = http_client
        .execute_request(
            reqwest::Method::GET,
            "/get-something",
            None,
            None,
            None,
        )
        .await;
    assert!(result1.is_ok(), "First API request should succeed");

    // Make second request - should reuse cached token
    let result2: Result<(), ApiError> = http_client
        .execute_request(
            reqwest::Method::GET,
            "/get-something",
            None,
            None,
            None,
        )
        .await;
    assert!(result2.is_ok(), "Second API request should succeed");

    // Verify token endpoint was called only ONCE (token was cached)
    wire_test_utils::verify_request_count("POST", "/token", None, 1)
        .await
        .unwrap();

    // Verify the API endpoint was called TWICE
    wire_test_utils::verify_request_count("GET", "/get-something", None, 2)
        .await
        .unwrap();
}

/// Test that the OAuthTokenProvider correctly stores credentials.
#[tokio::test]
async fn test_oauth_token_provider_credentials() {
    let provider = OAuthTokenProvider::new(
        "my_client_id".to_string(),
        "my_client_secret".to_string(),
    );

    assert_eq!(provider.client_id(), "my_client_id");
    assert_eq!(provider.client_secret(), "my_client_secret");
    assert!(provider.needs_refresh(), "New provider should need refresh");
}
