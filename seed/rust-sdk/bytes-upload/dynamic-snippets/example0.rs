use seed_bytes_upload::{BytesUploadClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = BytesUploadClient::new(config).expect("Failed to build client");
    client.service_upload(todo!("Invalid bytes value")).await;
}
