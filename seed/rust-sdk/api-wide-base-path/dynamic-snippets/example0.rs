use seed_api_wide_base_path::{ApiWideBasePathClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ApiWideBasePathClient::new(config).expect("Failed to build client");
    client
        .service_post("pathParam", "serviceParam", "resourceParam", 1)
        .await;
}
