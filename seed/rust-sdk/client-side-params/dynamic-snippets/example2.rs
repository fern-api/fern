use seed_client_side_params::{ClientConfig, ClientSideParamsClient, SearchResourcesRequest};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .search_resources(
            &SearchResourcesRequest {
                limit: 1,
                offset: 1,
                query: Some("query".to_string()),
                filters: Some(HashMap::from([(
                    "filters".to_string(),
                    serde_json::json!({"key":"value"}),
                )])),
            },
            None,
        )
        .await;
}
