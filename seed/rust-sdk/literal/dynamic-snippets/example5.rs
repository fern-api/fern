use seed_literal::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client.path.send(&"123".to_string(), None).await;
}
