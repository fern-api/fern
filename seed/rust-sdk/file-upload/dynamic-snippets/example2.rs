use seed_file_upload::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = FileUploadClient::new(config).expect("Failed to build client");
    client.service.simple(None).await;
}
