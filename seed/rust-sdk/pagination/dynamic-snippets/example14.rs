use seed_pagination::{ClientConfig, ListUsersMixedTypeCursorPaginationRequest, PaginationClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users_list_with_mixed_type_cursor_pagination(ListUsersMixedTypeCursorPaginationRequest {
            cursor: Some("cursor"),
        })
        .await;
}
