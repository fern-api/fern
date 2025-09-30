use seed_api::{ApiClient, ClientConfig, UploadDocumentRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .upload_json_document(&UploadDocumentRequest {}, None)
        .await;
}
