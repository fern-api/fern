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
        .list_with_body_offset_pagination(
            &ListUsersBodyOffsetPaginationRequest {
                pagination: Some(WithPage {
                    page: Some(1),
                    ..Default::default()
                }),
                ..Default::default()
            },
            None,
        )
        .await;
}
