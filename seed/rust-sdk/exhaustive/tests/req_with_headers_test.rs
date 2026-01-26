use base64::Engine;
use num_bigint::BigInt;
use seed_exhaustive::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_req_with_headers_get_with_custom_header_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::WIREMOCK_BASE_URL;

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExhaustiveClient::new(config).expect("Failed to build client");

    let result = client
        .req_with_headers
        .get_with_custom_header(
            &"string".to_string(),
            Some(
                RequestOptions::new()
                    .additional_header("X-TEST-SERVICE-HEADER", "X-TEST-SERVICE-HEADER")
                    .additional_header("X-TEST-ENDPOINT-HEADER", "X-TEST-ENDPOINT-HEADER"),
            ),
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/test-headers/custom-header", None, 1)
        .await
        .unwrap();
}
