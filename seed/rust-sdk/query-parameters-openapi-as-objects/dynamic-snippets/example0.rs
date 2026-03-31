use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .search(
            &SearchQueryRequest {
                limit: 1,
                id: "id".to_string(),
                date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
                deadline: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                bytes: "bytes".to_string(),
                user: User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                    ..Default::default()
                },
                user_list: vec![Some(User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                    ..Default::default()
                })],
                optional_deadline: Some(
                    DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                ),
                key_value: Some(HashMap::from([(
                    "keyValue".to_string(),
                    "keyValue".to_string(),
                )])),
                optional_string: Some("optionalString".to_string()),
                nested_user: Some(NestedUser {
                    name: Some("name".to_string()),
                    user: Some(User {
                        name: Some("name".to_string()),
                        tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                        ..Default::default()
                    }),
                    ..Default::default()
                }),
                optional_user: Some(User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                    ..Default::default()
                }),
                exclude_user: vec![Some(User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                    ..Default::default()
                })],
                filter: vec![Some("filter".to_string())],
                tags: vec![Some("tags".to_string())],
                optional_tags: vec![Some("optionalTags".to_string())],
                neighbor: Some(SearchRequestNeighbor::User(User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                    ..Default::default()
                })),
                neighbor_required: SearchRequestNeighborRequired::User(User {
                    name: Some("name".to_string()),
                    tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                    ..Default::default()
                }),
            },
            None,
        )
        .await;
}
