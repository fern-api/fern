use seed_examples::{ClientConfig, ExamplesClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client.health_service_check("id-3tey93i").await;
}
