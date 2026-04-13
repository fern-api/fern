use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .listresources(
            &ListresourcesQueryRequest {
                page_limit: 1,
                before_date: NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
            },
            None,
        )
        .await;
}
