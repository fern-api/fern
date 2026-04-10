use seed_multi_line_docs::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = MultiLineDocsClient::new(config).expect("Failed to build client");
    client
        .user
        .create_user(
            &CreateUserRequest {
                name: "name".to_string(),
                age: Some(1),
            },
            None,
        )
        .await;
}
