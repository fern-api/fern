use base64::Engine;
use num_bigint::BigInt;
use seed_exhaustive::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_inlined_requests_post_with_object_bodyand_response_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::WIREMOCK_BASE_URL;

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    let client = ExhaustiveClient::new(config).expect("Failed to build client");

    let result = client
        .inlined_requests
        .post_with_object_bodyand_response(
            &PostWithObjectBody {
                string: "string".to_string(),
                integer: 1,
                nested_object: ObjectWithOptionalField {
                    string: Some("string".to_string()),
                    integer: Some(1),
                    long: Some(1000000),
                    double: Some(1.1),
                    bool: Some(true),
                    datetime: Some(DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap()),
                    date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                    uuid: Some(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
                    base_64: Some(
                        base64::engine::general_purpose::STANDARD
                            .decode("SGVsbG8gd29ybGQh")
                            .unwrap(),
                    ),
                    list: Some(vec!["list".to_string(), "list".to_string()]),
                    set: Some(HashSet::from(["set".to_string()])),
                    map: Some(HashMap::from([(1, "map".to_string())])),
                    bigint: Some(BigInt::parse_bytes("1000000".as_bytes(), 10).unwrap()),
                },
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count("POST", "/req-bodies/object", None, 1)
        .await
        .unwrap();
}
