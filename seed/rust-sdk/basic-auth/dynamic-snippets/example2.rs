use seed_basic_auth::{BasicAuthClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        username: Some("<username>".to_string()),
        password: Some("<password>".to_string()),
    };
    let client = BasicAuthClient::new(config).expect("Failed to build client");
    client.basic_auth_get_with_basic_auth().await;
}
