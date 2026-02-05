use seed_server_sent_events::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_completions_stream_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::WIREMOCK_BASE_URL;

    let mut config = ClientConfig {
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ServerSentEventsClient::new(config).expect("Failed to build client");

    let result = client
        .completions
        .stream(
            &StreamCompletionRequest {
                query: "query".to_string(),
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/stream", None, 1)
        .await
        .unwrap();
}
