use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .user_events_metadata
        .user_events_metadata_get_metadata(
            &UserEventsMetadataGetMetadataQueryRequest {
                id: Id("id".to_string()),
            },
            None,
        )
        .await;
}
