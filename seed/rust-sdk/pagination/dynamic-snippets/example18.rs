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
        .users
        .list_with_mixed_type_cursor_pagination(
            &ListWithMixedTypeCursorPaginationQueryRequest {},
            None,
        )
        .await;
}
