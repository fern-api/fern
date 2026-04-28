use seed_basic_auth_environment_variables::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        username: Some("YOUR_USERNAME".to_string()),
        password: Some("YOUR_PASSWORD".to_string()),
        ..Default::default()
    };
    let client = BasicAuthEnvironmentVariablesClient::new(config).expect("Failed to build client");
    client
        .basic_auth
        .post_with_basic_auth(&serde_json::json!({"key":"value"}), None)
        .await;
}
