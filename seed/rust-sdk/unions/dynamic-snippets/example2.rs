use seed_unions::{ClientConfig, UnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client.bigunion_update_many(vec![serde_json::json!({"type":"normalSweet","value":"value","id":"id","created-at":"2024-01-15T09:30:00Z","archived-at":"2024-01-15T09:30:00Z"}), serde_json::json!({"type":"normalSweet","value":"value","id":"id","created-at":"2024-01-15T09:30:00Z","archived-at":"2024-01-15T09:30:00Z"})]).await;
}
