use seed_nullable::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = NullableClient::new(config).expect("Failed to build client");
    client
        .nullable
        .create_user(
            &CreateUserRequest {
                username: "username".to_string(),
                tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                metadata: Some(Metadata {
                    created_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                        .unwrap()
                        .with_timezone(&Utc),
                    updated_at: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                        .unwrap()
                        .with_timezone(&Utc),
                    avatar: Some("avatar".to_string()),
                    activated: Some(Some(true)),
                    status: Status::Active,
                    values: Some(HashMap::from([(
                        "values".to_string(),
                        Some(Some("values".to_string())),
                    )])),
                }),
                avatar: Some(Some("avatar".to_string())),
            },
            None,
        )
        .await;
}
