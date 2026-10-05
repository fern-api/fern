use seed_exhaustive::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_no_auth_post_with_no_auth_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_no_auth_post_with_no_auth_with_wiremock".to_string(),
    );
    let client = ExhaustiveClient::new(config).expect("Failed to build client");

    let result = client
        .no_auth
        .post_with_no_auth(&serde_json::json!({"key":"value"}), None)
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/no-auth", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_no_auth_post_with_no_auth_throws_bad_request_body_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.max_retries = 0;
    config.custom_headers.insert(
        "X-Test-Id".to_string(),
        "test_no_auth_post_with_no_auth_throws_bad_request_body_with_wiremock".to_string(),
    );
    let client = ExhaustiveClient::new(config).expect("Failed to build client");

    let result = client
        .no_auth
        .post_with_no_auth(&serde_json::json!({"key":"value"}), None)
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::BadRequestBody"
    );
    match result {
        Err(ApiError::BadRequestBody { message, .. }) => {
            assert_eq!(message, "message");
        }
        Err(other) => panic!("Expected ApiError::BadRequestBody, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::BadRequestBody, got a successful response"),
    }

    wire_test_utils::verify_request_count("POST", "/no-auth", None, 1)
        .await
        .unwrap();
}
