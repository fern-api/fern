use seed_pagination::{ClientConfig, ListUsersCursorPaginationRequest, PaginationClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .inline_users_inline_users_list_with_cursor_pagination(ListUsersCursorPaginationRequest {
            page: Some(1.1),
            per_page: Some(1.1),
            order: Some("asc"),
            starting_after: Some("starting_after"),
        })
        .await;
}
