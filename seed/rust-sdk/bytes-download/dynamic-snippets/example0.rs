use seed_bytes_download::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = BytesDownloadClient::new(config).expect("Failed to build client");
    client.service.simple(None).await;
}
