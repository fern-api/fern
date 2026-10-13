use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .knowledge
        .upload_knowledge(
            &UploadKnowledgeRequest {
                file0: b"test file content".to_vec(),
                file1: b"test file content".to_vec(),
                url_path: None,
                display_name2: None,
            },
            None,
        )
        .await;
}
