use seed_pagination::{ClientConfig, ListUsersExtendedRequest, PaginationClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users_list_with_extended_results(ListUsersExtendedRequest {
            cursor: Some(todo!("Unhandled primitive: UUID")),
        })
        .await;
}
