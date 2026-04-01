use seed_file_download::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = FileDownloadClient::new(config).expect("Failed to build client");
    client.service.simple(None).await;
}
