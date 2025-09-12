use seed_literal::{ClientConfig, LiteralClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = LiteralClient::new(config).expect("Failed to build client");
    client.path_send("123").await;
}
