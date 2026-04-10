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
        .listresources(
            &ListresourcesQueryRequest {
                page: 1,
                per_page: 1,
                sort: "sort".to_string(),
                order: "order".to_string(),
                include_totals: true,
                fields: None,
                search: None,
            },
            None,
        )
        .await;
}
