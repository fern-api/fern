use seed_examples::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_file_notification_service_get_exception_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::WIREMOCK_BASE_URL;

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExamplesClient::new(config).expect("Failed to build client");

    let result = client
        .file
        .notification
        .service
        .get_exception(&"notification-hsy129x".to_string(), None)
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "GET",
        "/file/notification/notification-hsy129x",
        None,
        1,
    )
    .await
    .unwrap();
}
