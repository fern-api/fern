use seed_unions::{ClientConfig, UnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client.bigunion.get(&"id".to_string(), None).await;
}
