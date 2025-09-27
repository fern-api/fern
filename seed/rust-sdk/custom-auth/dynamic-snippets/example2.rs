use seed_custom_auth::{ClientConfig, CustomAuthClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<value>".to_string()),
    };
    let client = CustomAuthClient::new(config).expect("Failed to build client");
    client.custom_auth_get_with_custom_auth().await;
}
