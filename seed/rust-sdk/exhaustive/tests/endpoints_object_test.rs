use seed_api::prelude::*;

mod wire_test_utils;

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_with_optional_field_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_with_optional_field(
            &TypesObjectWithOptionalField {
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-with-optional-field",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_with_required_field_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_with_required_field(
            &TypesObjectWithRequiredField {
                string: "string".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-with-required-field",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_with_map_of_map_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_with_map_of_map(
            &TypesObjectWithMapOfMap {
                map: HashMap::from([(
                    "key".to_string(),
                    HashMap::from([("key".to_string(), "value".to_string())]),
                )]),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-with-map-of-map",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_nested_with_optional_field_with_wiremock(
) {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_nested_with_optional_field(
            &TypesNestedObjectWithOptionalField {
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-nested-with-optional-field",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_nested_with_required_field_with_wiremock(
) {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_nested_with_required_field(
            &"string".to_string(),
            &TypesNestedObjectWithRequiredField {
                string: "string".to_string(),
                nested_object: TypesObjectWithOptionalField {
                    ..Default::default()
                },
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-nested-with-required-field/string",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_nested_with_required_field_as_list_with_wiremock(
) {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_nested_with_required_field_as_list(
            &vec![TypesNestedObjectWithRequiredField {
                string: "string".to_string(),
                nested_object: TypesObjectWithOptionalField {
                    ..Default::default()
                },
                ..Default::default()
            }],
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-nested-with-required-field-list",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_with_unknown_field_with_wiremock() {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_with_unknown_field(
            &TypesObjectWithUnknownField {
                unknown: serde_json::json!({"key":"value"}),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-with-unknown-field",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_with_documented_unknown_type_with_wiremock(
) {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_with_documented_unknown_type(
            &TypesObjectWithDocumentedUnknownType {
                documented_unknown_type: TypesDocumentedUnknownType(
                    serde_json::json!({"key":"value"}),
                ),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-with-documented-unknown-type",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_map_of_documented_unknown_type_with_wiremock(
) {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_map_of_documented_unknown_type(
            &TypesMapOfDocumentedUnknownType(HashMap::from([])),
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-map-of-documented-unknown-type",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_with_mixed_required_and_optional_fields_with_wiremock(
) {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_with_mixed_required_and_optional_fields(
            &TypesObjectWithMixedRequiredAndOptionalFields {
                required_string: "requiredString".to_string(),
                required_integer: 1,
                required_long: 1000000,
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-with-mixed-required-and-optional-fields",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_with_required_nested_object_with_wiremock(
) {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_with_required_nested_object(
            &TypesObjectWithRequiredNestedObject {
                required_string: "requiredString".to_string(),
                required_object: TypesNestedObjectWithRequiredField {
                    string: "string".to_string(),
                    nested_object: TypesObjectWithOptionalField {
                        ..Default::default()
                    },
                    ..Default::default()
                },
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-with-required-nested-object",
        None,
        1,
    )
    .await
    .unwrap();
}

#[tokio::test]
#[allow(unused_variables, unreachable_code)]
async fn test_endpoints_object_endpoints_object_get_and_return_with_datetime_like_string_with_wiremock(
) {
    wire_test_utils::reset_wiremock_requests().await.unwrap();
    let wiremock_base_url = wire_test_utils::get_wiremock_base_url();

    let mut config = ClientConfig {
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    config.base_url = wiremock_base_url.to_string();
    config.environment = None;
    let client = ApiClient::new(config).expect("Failed to build client");

    let result = client
        .endpoints_object
        .endpoints_object_get_and_return_with_datetime_like_string(
            &TypesObjectWithDatetimeLikeString {
                datetime_like_string: "datetimeLikeString".to_string(),
                actual_datetime: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                ..Default::default()
            },
            None,
        )
        .await;

    assert!(result.is_ok(), "Client method call should succeed");

    wire_test_utils::verify_request_count(
        "POST",
        "/object/get-and-return-with-datetime-like-string",
        None,
        1,
    )
    .await
    .unwrap();
}
