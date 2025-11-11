use seed_audiences::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = AudiencesClient::new(config).expect("Failed to build client");
    client
        .folder_a
        .service
        .get_direct_thread(
            &GetDirectThreadQueryRequest {
                ids: vec!["ids".to_string()],
                tags: vec!["tags".to_string()],
            },
            None,
        )
        .await;
}
