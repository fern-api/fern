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
        .users
        .listwithoffsetsteppagination(
            &ListwithoffsetsteppaginationQueryRequest {
                page: Some(1),
                limit: Some(1),
                order: Some(Order::Asc),
                ..Default::default()
            },
            None,
        )
        .await;
}
