use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .object
        .get_and_return_nested_with_required_field_as_list(
            &vec![
                NestedObjectWithRequiredField {
                    string: "string".to_string(),
                    nested_object: ObjectWithOptionalField {
                        string: Some("string".to_string()),
                        integer: Some(1),
                        long: Some(1000000),
                        double: Some(1.1),
                        bool: Some(true),
                        datetime: Some(
                            DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                                .unwrap()
                                .with_timezone(&Utc),
                        ),
                        date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                        uuid: Some(
                            Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                        ),
                        base_64: Some("SGVsbG8gd29ybGQh".to_string()),
                        list: Some(vec!["list".to_string(), "list".to_string()]),
                        set: Some(HashSet::from(["set".to_string()])),
                        map: Some(HashMap::from([(1, "map".to_string())])),
                        bigint: Some("1000000".to_string()),
                    },
                },
                NestedObjectWithRequiredField {
                    string: "string".to_string(),
                    nested_object: ObjectWithOptionalField {
                        string: Some("string".to_string()),
                        integer: Some(1),
                        long: Some(1000000),
                        double: Some(1.1),
                        bool: Some(true),
                        datetime: Some(
                            DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                                .unwrap()
                                .with_timezone(&Utc),
                        ),
                        date: Some(NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap()),
                        uuid: Some(
                            Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                        ),
                        base_64: Some("SGVsbG8gd29ybGQh".to_string()),
                        list: Some(vec!["list".to_string(), "list".to_string()]),
                        set: Some(HashSet::from(["set".to_string()])),
                        map: Some(HashMap::from([(1, "map".to_string())])),
                        bigint: Some("1000000".to_string()),
                    },
                },
            ],
            None,
        )
        .await;
}
