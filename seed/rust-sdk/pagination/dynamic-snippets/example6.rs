use seed_pagination::prelude::*;
use std::collections::HashMap;

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
        .list_with_mixed_type_cursor_pagination(
            &ListWithMixedTypeCursorPaginationQueryRequest {},
            None,
        )
        .await;
}
