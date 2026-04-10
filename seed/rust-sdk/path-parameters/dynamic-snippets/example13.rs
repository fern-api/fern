use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .user
        .searchusers(
            &"tenant_id".to_string(),
            &"user_id".to_string(),
            &SearchusersQueryRequest {
                limit: Some(1),
                ..Default::default()
            },
            None,
        )
        .await;
}
