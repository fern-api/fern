use seed_nullable::{ClientConfig, CreateUserRequest, NullableClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = NullableClient::new(config).expect("Failed to build client");
    client.nullable_create_user(CreateUserRequest { username: "username", tags: Some(vec!["tags", "tags"]), metadata: Some(serde_json::json!({"createdAt":"2024-01-15T09:30:00Z","updatedAt":"2024-01-15T09:30:00Z","avatar":"avatar","activated":true,"status":{"type":"active"},"values":{"values":"values"}})), avatar: Some(Some("avatar")) }).await;
}
