use seed_single_url_environment_no_default::{ClientConfig, SingleUrlEnvironmentNoDefaultClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = SingleUrlEnvironmentNoDefaultClient::new(config).expect("Failed to build client");
    client.dummy_get_dummy().await;
}
