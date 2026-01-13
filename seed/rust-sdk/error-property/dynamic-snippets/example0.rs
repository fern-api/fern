use seed_error_property::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ErrorPropertyClient::new(config).expect("Failed to build client");
    client.property_based_error.throw_error(None).await;
}
