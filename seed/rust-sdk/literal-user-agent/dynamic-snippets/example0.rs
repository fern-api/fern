use seed_literal_user_agent::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = LiteralUserAgentClient::new(config).expect("Failed to build client");
    client.ping(None).await;
}
