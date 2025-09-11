use seed_file_upload::{ClientConfig, FileUploadClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = FileUploadClient::new(config).expect("Failed to build client");
    client.service_simple().await;
}
