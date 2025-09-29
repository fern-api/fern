use seed_enum::{ClientConfig, EnumClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = EnumClient::new(config).expect("Failed to build client");
    client.headers.send(None).await;
}
