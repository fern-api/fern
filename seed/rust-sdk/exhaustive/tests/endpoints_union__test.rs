use seed_exhaustive::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_union__get_and_return_union_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::WIREMOCK_BASE_URL;

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExhaustiveClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints
        .union_
        .get_and_return_union(
            &Animal::Dog {
                data: Dog {
                    name: "name".to_string(),
                    likes_to_woof: true,
                },
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/union", None, 1)
        .await
        .unwrap();
}
