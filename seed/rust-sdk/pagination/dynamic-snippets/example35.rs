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
        .listwithoffsetpagination(
            &ListwithoffsetpaginationQueryRequest {
                page: Some(1),
                per_page: Some(1),
                order: Some(Order::Asc),
                starting_after: Some("starting_after".to_string()),
                ..Default::default()
            },
            None,
        )
        .await;
}
