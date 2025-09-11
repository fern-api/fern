use seed_basic_auth::{ClientConfig, BasicAuthClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        username: Some("<username>".to_string()),
        password: Some("<password>".to_string())
    };
    let client = BasicAuthClient::new(config).expect("Failed to build client");
    client.basic_auth_get_with_basic_auth().await;
}
