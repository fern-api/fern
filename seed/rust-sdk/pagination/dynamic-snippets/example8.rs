use seed_pagination::prelude::*;
use seed_pagination::Order;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users
        .inline_users
        .list_with_offset_step_pagination(
            &ListWithOffsetStepPaginationQueryRequest {
                page: Some(1),
                limit: Some(1),
                order: Some(Order::Asc),
            },
            None,
        )
        .await;
}
