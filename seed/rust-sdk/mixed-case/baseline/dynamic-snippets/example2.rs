use seed_mixed_case::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = MixedCaseClient::new(config).expect("Failed to build client");
    client
        .service
        .list_resources(
            &ListResourcesQueryRequest {
                page_limit: 10,
                before_date: NaiveDate::parse_from_str("2023-01-01", "%Y-%m-%d").unwrap(),
            },
            None,
        )
        .await;
}
