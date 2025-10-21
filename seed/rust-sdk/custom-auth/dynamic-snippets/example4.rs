use seed_custom_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<value>".to_string()),
        ..Default::default()
    };
    let client = CustomAuthClient::new(config).expect("Failed to build client");
    client
        .custom_auth
        .post_with_custom_auth(&serde_json::json!({"key":"value"}), None)
        .await;
}
