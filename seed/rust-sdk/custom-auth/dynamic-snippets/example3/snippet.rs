use seed_custom_auth::{ClientConfig, CustomAuthClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<value>".to_string())
    };
    let client = CustomAuthClient::new(config).expect("Failed to build client");
    client.custom_auth_post_with_custom_auth(serde_json::json!({"key":"value"})).await;
}
