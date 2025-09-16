use seed_unions::{ClientConfig, UnionsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = UnionsClient::new(config).expect("Failed to build client");
    client.bigunion_get("id").await;
}
