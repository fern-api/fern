use seed_pagination::{ClientConfig, ListUsernamesRequestCustom, PaginationClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = PaginationClient::new(config).expect("Failed to build client");
    client
        .users_list_usernames_custom(ListUsernamesRequestCustom {
            starting_after: Some("starting_after"),
        })
        .await;
}
