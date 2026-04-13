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
        .createuser(
            &UserCreateUserRequest {
                r#type: UserCreateUserRequestType::CreateUserRequest,
                version: UserCreateUserRequestVersion::V1,
                name: "name".to_string(),
            },
            None,
        )
        .await;
}
