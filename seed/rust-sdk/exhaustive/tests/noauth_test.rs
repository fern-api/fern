use seed_api::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_noauth_postwithnoauth_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .noauth
        .postwithnoauth(&serde_json::json!({"key":"value"}), None)
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/no-auth", None, 1)
        .await
        .unwrap();
}
