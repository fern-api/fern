use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .products
        .search(
            &"regionId".to_string(),
            &SearchProductsRequest {
                query: Some("query".to_string()),
                config: Some(SearchProductsRequestConfig {
                    currency: Some("currency".to_string()),
                    limit: Some(1),
                    ..Default::default()
                }),
                ..Default::default()
            },
            None,
        )
        .await;
}
