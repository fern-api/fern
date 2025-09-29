use seed_file_download::{ClientConfig, FileDownloadClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = FileDownloadClient::new(config).expect("Failed to build client");
    client.service_simple().await;
}
