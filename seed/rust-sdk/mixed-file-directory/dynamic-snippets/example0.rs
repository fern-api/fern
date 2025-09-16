use seed_mixed_file_directory::{ClientConfig, MixedFileDirectoryClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client
        .organization_create(serde_json::json!({"name":"name"}))
        .await;
}
