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
        .get_user_metadata(&"tenant_id".to_string(), &"user_id".to_string(), &1, None)
        .await;
}
