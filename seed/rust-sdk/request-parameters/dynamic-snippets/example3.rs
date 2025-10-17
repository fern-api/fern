use seed_request_parameters::prelude::*;
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = RequestParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .create_username_optional(
            &Some(Some(CreateUsernameBodyOptionalProperties {
                username: Some("username".to_string()),
                password: Some("password".to_string()),
                name: Some("test".to_string()),
            })),
            None,
        )
        .await;
}
