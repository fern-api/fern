use seed_accept::{AcceptClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = AcceptClient::new(config).expect("Failed to build client");
    client.service_endpoint().await;
}
