use seed_error_property::{ClientConfig, ErrorPropertyClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ErrorPropertyClient::new(config).expect("Failed to build client");
    client.property_based_error_throw_error().await;
}
