use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .nullable
        .getusers(
            &GetusersQueryRequest {
                usernames: vec![Some("usernames".to_string())],
                avatar: Some("avatar".to_string()),
                activated: vec![Some(true)],
                tags: vec![Some("tags".to_string())],
                extra: Some(true),
            },
            None,
        )
        .await;
}
