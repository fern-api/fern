use seed_api::{ApiClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ApiClient::new(config).expect("Failed to build client");
    client.foo().await;
}
