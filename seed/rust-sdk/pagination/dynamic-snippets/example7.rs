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
        .inline_users_inline_users
        .inline_users_inline_users_list_with_body_cursor_pagination(
            &InlineUsersInlineUsersListWithBodyCursorPaginationRequest {
                pagination: Some(InlineUsersWithCursor {
                    cursor: Some("cursor".to_string()),
                    ..Default::default()
                }),
                ..Default::default()
            },
            None,
        )
        .await;
}
