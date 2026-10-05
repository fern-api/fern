use seed_examples::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_health_service_check_with_wiremock() {
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
        "test_health_service_check_with_wiremock".to_string(),
    );
    let client = ExamplesClient::new(config).expect("Failed to build client");

    let result = client
        .health
        .service
        .check(&"id-2sdx82h".to_string(), None)
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("GET", "/check/id-2sdx82h", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_health_service_check_example2_with_wiremock() {
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
        "test_health_service_check_example2_with_wiremock".to_string(),
    );
    let client = ExamplesClient::new(config).expect("Failed to build client");

    let result = client
        .health
        .service
        .check(&"id-3tey93i".to_string(), None)
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("GET", "/check/id-3tey93i", None, 1)
        .await
        .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_health_service_ping_with_wiremock() {
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
        "test_health_service_ping_with_wiremock".to_string(),
    );
    let client = ExamplesClient::new(config).expect("Failed to build client");

    let result = client.health.service.ping(None).await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("GET", "/ping", None, 1)
        .await
        .unwrap();
}
