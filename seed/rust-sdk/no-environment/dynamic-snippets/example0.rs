use seed_no_environment::{ClientConfig, NoEnvironmentClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = NoEnvironmentClient::new(config).expect("Failed to build client");
    client.dummy_get_dummy().await;
}
