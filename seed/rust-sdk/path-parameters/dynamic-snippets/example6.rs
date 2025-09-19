use seed_path_parameters::{ClientConfig, PathParametersClient, SearchUsersRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .user_search_users(
            "tenant_id",
            "user_id",
            SearchUsersRequest { limit: Some(1) },
        )
        .await;
}
