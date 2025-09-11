use seed_api::{ClientConfig, ApiClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ApiClient::new(config).expect("Failed to build client");
    client.folder_service_unknown_request(serde_json::json!({"key":"value"})).await;
}
