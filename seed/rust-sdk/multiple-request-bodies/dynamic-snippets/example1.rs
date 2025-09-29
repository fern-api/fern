use seed_api::{ApiClient, ClientConfig, UploadDocumentRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .upload_json_document(UploadDocumentRequest {
            author: Some("author"),
            tags: Some(vec!["tags", "tags"]),
            title: Some("title"),
        })
        .await;
}
