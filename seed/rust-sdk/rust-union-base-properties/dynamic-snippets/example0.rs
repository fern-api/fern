use seed_rust_union_base_properties::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = RustUnionBasePropertiesClient::new(config).expect("Failed to build client");
    client.get(None).await;
}
