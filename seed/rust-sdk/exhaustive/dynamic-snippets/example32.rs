use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .pagination
        .list_items(
            &ListItemsQueryRequest {
                cursor: Some("cursor".to_string()),
                limit: Some(1),
                ..Default::default()
            },
            None,
        )
        .await;
}
