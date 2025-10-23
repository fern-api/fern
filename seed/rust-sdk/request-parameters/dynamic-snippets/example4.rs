use seed_request_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = RequestParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .get_username(
            &GetUsernameQueryRequest {
                limit: 1,
                id: Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
                deadline: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                    .unwrap()
                    .with_timezone(&Utc),
                bytes: "SGVsbG8gd29ybGQh".to_string(),
                user: User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
                },
                user_list: vec![
                    User {
                        name: "name".to_string(),
                        tags: vec!["tags".to_string(), "tags".to_string()],
                    },
                    User {
                        name: "name".to_string(),
                        tags: vec!["tags".to_string(), "tags".to_string()],
                    },
                ],
                optional_deadline: Some(
                    DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                        .unwrap()
                        .with_timezone(&Utc),
                ),
                key_value: HashMap::from([("keyValue".to_string(), "keyValue".to_string())]),
                optional_string: Some("optionalString".to_string()),
                nested_user: NestedUser {
                    name: "name".to_string(),
                    user: User {
                        name: "name".to_string(),
                        tags: vec!["tags".to_string(), "tags".to_string()],
                    },
                },
                optional_user: Some(User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
                }),
                exclude_user: vec![User {
                    name: "name".to_string(),
                    tags: vec!["tags".to_string(), "tags".to_string()],
                }],
                filter: vec!["filter".to_string()],
                long_param: 1000000,
                big_int_param: "1000000".to_string(),
            },
            None,
        )
        .await;
}
