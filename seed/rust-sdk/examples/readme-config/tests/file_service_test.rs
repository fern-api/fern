use seed_examples::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_file_service_get_file_throws_not_found_error_with_wiremock() {
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
        "test_file_service_get_file_throws_not_found_error_with_wiremock".to_string(),
    );
    let client = ExamplesClient::new(config).expect("Failed to build client");

    let result = client
        .file
        .service
        .get_file(
            &"file.txt".to_string(),
            Some(RequestOptions::new().additional_header("X-File-API-Version", "0.0.2")),
        )
        .await;

    assert!(
        result.is_err(),
        "Client method call should fail with ApiError::NotFoundError"
    );
    match result {
        Err(ApiError::NotFoundError { message, .. }) => {
            assert_eq!(message, "Unknown error");
        }
        Err(other) => panic!("Expected ApiError::NotFoundError, got {:?}", other),
        Ok(_) => panic!("Expected ApiError::NotFoundError, got a successful response"),
    }

    wire_test_utils::verify_request_count("GET", "/file/file.txt", None, 1)
        .await
        .unwrap();
}
