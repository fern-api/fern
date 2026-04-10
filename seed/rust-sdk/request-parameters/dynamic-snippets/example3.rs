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
        .createusernameoptional(
            &CreateUsernameBodyOptionalProperties {
                username: Some("username".to_string()),
                password: Some("password".to_string()),
                name: Some("name".to_string()),
                ..Default::default()
            },
            None,
        )
        .await;
}
