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
        .service
        .searchresources(
            &ServiceSearchResourcesRequest {
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
