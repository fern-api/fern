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
        .delete_user(
            &DeleteUserRequest {
                username: Some(Some("xy".to_string())),
            },
            None,
        )
        .await;
}
