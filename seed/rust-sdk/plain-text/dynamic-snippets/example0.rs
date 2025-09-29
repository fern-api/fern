use seed_plain_text::{ClientConfig, PlainTextClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = PlainTextClient::new(config).expect("Failed to build client");
    client.service_get_text().await;
}
