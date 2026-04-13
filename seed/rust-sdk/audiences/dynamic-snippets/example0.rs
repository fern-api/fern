use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .folder_a_service
        .folder_a_service_get_direct_thread(
            &FolderAServiceGetDirectThreadQueryRequest {
                ids: vec![Some("ids".to_string())],
                tags: vec![Some("tags".to_string())],
            },
            None,
        )
        .await;
}
