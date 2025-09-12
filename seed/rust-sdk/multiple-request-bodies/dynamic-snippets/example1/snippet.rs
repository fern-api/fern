use seed_api::{ClientConfig, ApiClient, UploadDocumentRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.upload_json_document(UploadDocumentRequest { author: Some("author"), tags: Some(vec!["tags", "tags"]), title: Some("title") }).await;
}
