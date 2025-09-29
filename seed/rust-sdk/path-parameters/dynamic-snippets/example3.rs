use seed_path_parameters::{ClientConfig, GetUsersRequest, PathParametersClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .user_get_user("tenant_id", "user_id", GetUsersRequest {})
        .await;
}
