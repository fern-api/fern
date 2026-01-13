use seed_pagination::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client.users.list_with_top_level_body_cursor_pagination(&ListUsersTopLevelBodyCursorPaginationRequest {
        cursor: Some("initial_cursor".to_string()),
        filter: Some("active".to_string())
    }, None).await;
}
