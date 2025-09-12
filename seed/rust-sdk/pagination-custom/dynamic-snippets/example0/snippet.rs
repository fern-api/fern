use seed_pagination::{ClientConfig, PaginationClient, ListUsernamesRequestCustom};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client.users_list_usernames_custom(ListUsernamesRequestCustom { starting_after: Some("starting_after") }).await;
}
