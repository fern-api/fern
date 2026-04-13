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
        .createuser(
            &NullableCreateUserRequest {
                username: "username".to_string(),
                tags: None,
                metadata: None,
                avatar: None,
            },
            None,
        )
        .await;
}
