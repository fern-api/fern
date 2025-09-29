use seed_nullable_optional::{ClientConfig, NullableOptionalClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client.nullable_optional_get_user("userId").await;
}
