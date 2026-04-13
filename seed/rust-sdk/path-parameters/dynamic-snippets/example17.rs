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
        .getuserspecifics(
            &"tenant_id".to_string(),
            &"user_id".to_string(),
            1,
            &"thought".to_string(),
            None,
        )
        .await;
}
