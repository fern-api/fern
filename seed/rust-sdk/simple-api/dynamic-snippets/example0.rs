use seed_simple_api::{ClientConfig, SimpleApiClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = SimpleApiClient::new(config).expect("Failed to build client");
    client.user_get("id").await;
}
