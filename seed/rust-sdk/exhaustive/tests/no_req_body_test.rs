use seed_exhaustive::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_no_req_body_get_with_no_request_body_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::WIREMOCK_BASE_URL;

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExhaustiveClient::new(config).expect("Failed to build client");

    let result = client.no_req_body.get_with_no_request_body(None).await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("GET", "/no-req-body", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_no_req_body_post_with_no_request_body_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::WIREMOCK_BASE_URL;

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExhaustiveClient::new(config).expect("Failed to build client");

    let result = client.no_req_body.post_with_no_request_body(None).await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/no-req-body", None, 1)
        .await
        .unwrap();
}
