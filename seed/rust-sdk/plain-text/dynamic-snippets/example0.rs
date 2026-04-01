use seed_plain_text::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = PlainTextClient::new(config).expect("Failed to build client");
    client.service.get_text(None).await;
}
