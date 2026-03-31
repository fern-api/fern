use seed_exhaustive::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_pagination_list_items_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExhaustiveClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints
        .pagination
        .list_items(
            &ListItemsQueryRequest {
                cursor: Some("cursor".to_string()),
                limit: Some(1),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "GET",
        "/pagination",
        Some(HashMap::from([
            ("cursor".to_string(), "cursor".to_string()),
            ("limit".to_string(), "1".to_string()),
        ])),
        1,
    )
    .await
    .unwrap();
}
