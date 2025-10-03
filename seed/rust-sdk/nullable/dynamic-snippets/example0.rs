use seed_nullable::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = NullableClient::new(config).expect("Failed to build client");
    client
        .nullable
        .get_users(
            &GetUsersQueryRequest {
                usernames: vec![Some("usernames".to_string())],
                avatar: Some("avatar".to_string()),
                activated: vec![Some(true)],
                tags: vec![Some(Some("tags".to_string()))],
                extra: Some(Some(true)),
            },
            None,
        )
        .await;
}
