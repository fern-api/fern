use seed_client_side_params::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ClientSideParamsClient::new(config).expect("Failed to build client");
    client
        .service
        .create_user(
            &CreateUserRequest {
                email: "email".to_string(),
                email_verified: Some(true),
                username: Some("username".to_string()),
                password: Some("password".to_string()),
                phone_number: Some("phone_number".to_string()),
                phone_verified: Some(true),
                user_metadata: Some(HashMap::from([(
                    "user_metadata".to_string(),
                    serde_json::json!({"key":"value"}),
                )])),
                app_metadata: Some(HashMap::from([(
                    "app_metadata".to_string(),
                    serde_json::json!({"key":"value"}),
                )])),
                connection: "connection".to_string(),
            },
            None,
        )
        .await;
}
