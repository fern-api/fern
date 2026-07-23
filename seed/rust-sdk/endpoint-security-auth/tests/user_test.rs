use seed_endpoint_security_auth::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_user_get_with_bearer_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("test-token".to_string()),
        api_key: Some("test-api-key".to_string()),
        username: Some("test-username".to_string()),
        password: Some("test-password".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");

    let result = client.user.get_with_bearer(None).await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("GET", "/users", None, 1)
        .await
        .unwrap();

    wire_test_utils::verify_auth_headers(
        "GET",
        "/users",
        HashMap::from([
            ("Authorization".to_string(), json!({"matches": "Bearer .*"})),
            ("X-API-Key".to_string(), json!({"absent": true})),
        ]),
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_user_get_with_api_key_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("test-token".to_string()),
        api_key: Some("test-api-key".to_string()),
        username: Some("test-username".to_string()),
        password: Some("test-password".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");

    let result = client.user.get_with_api_key(None).await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("GET", "/users", None, 1)
        .await
        .unwrap();

    wire_test_utils::verify_auth_headers(
        "GET",
        "/users",
        HashMap::from([
            ("Authorization".to_string(), json!({"absent": true})),
            ("X-API-Key".to_string(), json!({"matches": ".*"})),
        ]),
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_user_get_with_o_auth_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("test-token".to_string()),
        api_key: Some("test-api-key".to_string()),
        username: Some("test-username".to_string()),
        password: Some("test-password".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");

    let result = client.user.get_with_o_auth(None).await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("GET", "/users", None, 1)
        .await
        .unwrap();

    wire_test_utils::verify_auth_headers(
        "GET",
        "/users",
        HashMap::from([
            ("Authorization".to_string(), json!({"matches": "Bearer .*"})),
            ("X-API-Key".to_string(), json!({"absent": true})),
        ]),
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_user_get_with_basic_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("test-token".to_string()),
        api_key: Some("test-api-key".to_string()),
        username: Some("test-username".to_string()),
        password: Some("test-password".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");

    let result = client.user.get_with_basic(None).await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("GET", "/users", None, 1)
        .await
        .unwrap();

    wire_test_utils::verify_auth_headers(
        "GET",
        "/users",
        HashMap::from([
            ("Authorization".to_string(), json!({"matches": "Basic .*"})),
            ("X-API-Key".to_string(), json!({"absent": true})),
        ]),
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_user_get_with_inferred_auth_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("test-token".to_string()),
        api_key: Some("test-api-key".to_string()),
        username: Some("test-username".to_string()),
        password: Some("test-password".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");

    let result = client.user.get_with_inferred_auth(None).await;

    // The Rust SDK does not implement inferred auth, so this endpoint's security
    // requirement cannot be satisfied and the call errors before any request is sent.
    assert!(
        result.is_err(),
        "endpoint requires inferred auth, which the Rust SDK does not support"
    );

    wire_test_utils::verify_request_count("GET", "/users", None, 0)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_user_get_with_any_auth_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("test-token".to_string()),
        api_key: Some("test-api-key".to_string()),
        username: Some("test-username".to_string()),
        password: Some("test-password".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");

    let result = client.user.get_with_any_auth(None).await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("GET", "/users", None, 1)
        .await
        .unwrap();

    wire_test_utils::verify_auth_headers(
        "GET",
        "/users",
        HashMap::from([
            ("Authorization".to_string(), json!({"matches": "Bearer .*"})),
            ("X-API-Key".to_string(), json!({"absent": true})),
        ]),
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_user_get_with_all_auth_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("test-token".to_string()),
        api_key: Some("test-api-key".to_string()),
        username: Some("test-username".to_string()),
        password: Some("test-password".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");

    let result = client.user.get_with_all_auth(None).await;

    // The Rust SDK does not implement inferred auth, so this endpoint's security
    // requirement cannot be satisfied and the call errors before any request is sent.
    assert!(
        result.is_err(),
        "endpoint requires inferred auth, which the Rust SDK does not support"
    );

    wire_test_utils::verify_request_count("GET", "/users", None, 0)
        .await
        .unwrap();
}
