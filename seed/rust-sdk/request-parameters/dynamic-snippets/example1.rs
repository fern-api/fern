use seed_request_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = RequestParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .create_username_with_referenced_type(
            &CreateUsernameReferencedRequest {
                tags: vec!["tags".to_string(), "tags".to_string()],
                body: CreateUsernameBody {
                    username: "username".to_string(),
                    password: "password".to_string(),
                    name: "test".to_string(),
                },
            },
            None,
        )
        .await;
}
