use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .createuser(
            &CreateUserRequest {
                email: "email".to_string(),
                connection: "connection".to_string(),
                email_verified: None,
                username: None,
                password: None,
                phone_number: None,
                phone_verified: None,
                user_metadata: None,
                app_metadata: None,
            },
            None,
        )
        .await;
}
