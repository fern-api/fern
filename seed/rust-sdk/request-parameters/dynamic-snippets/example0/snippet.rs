use seed_request_parameters::{ClientConfig, RequestParametersClient, CreateUsernameRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = RequestParametersClient::new(config).expect("Failed to build client");
    client.user_create_username(CreateUsernameRequest { tags: vec!["tags", "tags"], username: "username", password: "password", name: "test" }).await;
}
