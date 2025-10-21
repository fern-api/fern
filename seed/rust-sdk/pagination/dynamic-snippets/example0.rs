use seed_pagination::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .complex
        .search(
            &"index".to_string(),
            &SearchRequest {
                pagination: Some(StartingAfterPaging {
                    per_page: 1,
                    starting_after: Some("starting_after".to_string()),
                }),
                query: SearchRequestQuery::SingleFilterSearchRequest(SingleFilterSearchRequest {
                    field: Some("field".to_string()),
                    operator: Some(SingleFilterSearchRequestOperator::Equals),
                    value: Some("value".to_string()),
                }),
            },
            None,
        )
        .await;
}
