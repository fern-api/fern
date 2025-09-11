use seed_api_wide_base_path::{ClientConfig, ApiWideBasePathClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ApiWideBasePathClient::new(config).expect("Failed to build client");
    client.service_post("pathParam", "serviceParam", "resourceParam", 1).await;
}
