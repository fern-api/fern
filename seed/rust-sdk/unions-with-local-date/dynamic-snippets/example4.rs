use seed_unions::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UnionsClient::new(config).expect("Failed to build client");
    client
        .types
        .get(&"datetime-example".to_string(), None)
        .await;
}
