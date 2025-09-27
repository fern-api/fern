use seed_mixed_file_directory::{ClientConfig, MixedFileDirectoryClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = MixedFileDirectoryClient::new(config).expect("Failed to build client");
    client
        .organization_create(serde_json::json!({"name":"name"}))
        .await;
}
