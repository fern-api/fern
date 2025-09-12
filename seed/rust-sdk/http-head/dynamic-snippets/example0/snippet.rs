use seed_http_head::{ClientConfig, HttpHeadClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = HttpHeadClient::new(config).expect("Failed to build client");
    client.user_head().await;
}
