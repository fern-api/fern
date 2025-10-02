use seed_auth_environment_variables::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<value>".to_string()),
        ..Default::default()
    };
    let client = AuthEnvironmentVariablesClient::new(config).expect("Failed to build client");
    client.service.get_with_api_key(None).await;
}
