use seed_error_property::{ClientConfig, ErrorPropertyClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ErrorPropertyClient::new(config).expect("Failed to build client");
    client.property_based_error_throw_error().await;
}
