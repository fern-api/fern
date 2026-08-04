use seed_endpoint_security_auth::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_auth_get_token_with_wiremock() {
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

    let result = client
        .auth
        .get_token(
            &GetTokenRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                audience: "https://api.example.com".to_string(),
                grant_type: "client_credentials".to_string(),
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/token", None, 1)
        .await
        .unwrap();

    wire_test_utils::verify_auth_headers(
        "POST",
        "/token",
        HashMap::from([
            ("Authorization".to_string(), json!({"absent": true})),
            ("X-API-Key".to_string(), json!({"absent": true})),
        ]),
    )
    .await
    .unwrap();
}
