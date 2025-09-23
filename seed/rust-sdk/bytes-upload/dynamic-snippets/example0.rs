use seed_bytes_upload::{BytesUploadClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = BytesUploadClient::new(config).expect("Failed to build client");
    client.service_upload(todo!("Invalid bytes value")).await;
}
