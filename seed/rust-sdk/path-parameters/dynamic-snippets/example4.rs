use seed_path_parameters::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = PathParametersClient::new(config).expect("Failed to build client");
    client
        .user
        .create_user(
            &"tenant_id".to_string(),
            &User {
                name: "name".to_string(),
                tags: vec!["tags".to_string(), "tags".to_string()],
            },
            None,
        )
        .await;
}
