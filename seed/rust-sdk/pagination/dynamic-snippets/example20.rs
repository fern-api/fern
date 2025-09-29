use seed_pagination::{ClientConfig, ListUsersOffsetStepPaginationRequest, PaginationClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users_list_with_offset_step_pagination(ListUsersOffsetStepPaginationRequest {
            page: Some(1),
            limit: Some(1),
            order: Some("asc"),
        })
        .await;
}
