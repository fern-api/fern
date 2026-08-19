use seed_websocket::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = WebsocketClient::new(config).expect("Failed to build client");
    client.status.get_status(None).await;
}
