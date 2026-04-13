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
        .listusers(
            &ListusersQueryRequest {
                page: Some(1),
                per_page: Some(1),
                include_totals: Some(true),
                sort: Some("sort".to_string()),
                connection: Some("connection".to_string()),
                q: Some("q".to_string()),
                search_engine: Some("search_engine".to_string()),
                fields: Some("fields".to_string()),
                ..Default::default()
            },
            None,
        )
        .await;
}
