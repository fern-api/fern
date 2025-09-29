use seed_request_parameters::{ClientConfig, CreateUsernameRequest, RequestParametersClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = RequestParametersClient::new(config).expect("Failed to build client");
    client
        .user_create_username(CreateUsernameRequest {
            tags: vec!["tags", "tags"],
            username: "username",
            password: "password",
            name: "test",
        })
        .await;
}
