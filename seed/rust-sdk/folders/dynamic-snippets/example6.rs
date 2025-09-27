use seed_api::{ApiClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .folder_service_unknown_request(serde_json::json!({"key":"value"}))
        .await;
}
