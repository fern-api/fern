use seed_extra_properties::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ExtraPropertiesClient::new(config).expect("Failed to build client");
    client
        .user
        .create_user(
            &CreateUserRequest {
                r#type: "CreateUserRequest".to_string(),
                version: "v1".to_string(),
                name: "name".to_string(),
            },
            None,
        )
        .await;
}
