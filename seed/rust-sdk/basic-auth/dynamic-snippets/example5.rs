use seed_basic_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        username: Some("<username>".to_string()),
        password: Some("<password>".to_string()),
        ..Default::default()
    };
    let client = BasicAuthClient::new(config).expect("Failed to build client");
    client
        .basic_auth
        .post_with_basic_auth(&serde_json::json!({"key":"value"}), None)
        .await;
}
