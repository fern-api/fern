use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .upload_json_document(
            &UploadDocumentRequest {
                author: Some("author".to_string()),
                tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                title: Some("title".to_string()),
                ..Default::default()
            },
            None,
        )
        .await;
}
