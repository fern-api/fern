use environment_test_sdk::{ClientConfig, SingleUrlEnvironmentDefaultClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = SingleUrlEnvironmentDefaultClient::new(config).expect("Failed to build client");
    client.dummy_get_dummy().await;
}
