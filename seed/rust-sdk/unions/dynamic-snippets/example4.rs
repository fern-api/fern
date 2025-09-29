use seed_unions::{ClientConfig, UnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client
        .bigunion_update(serde_json::json!({"type":"circle","radius":1.1,"id":"id"}))
        .await;
}
