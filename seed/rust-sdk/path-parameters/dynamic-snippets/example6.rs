use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .search_users(
            &"tenant_id".to_string(),
            &"user_id".to_string(),
            &SearchUsersQueryRequest {
                limit: Some(1),
                ..Default::default()
            },
            None,
        )
        .await;
}
