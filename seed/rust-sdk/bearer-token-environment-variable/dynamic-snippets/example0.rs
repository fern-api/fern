use seed_bearer_token_environment_variable::{BearerTokenEnvironmentVariableClient, ClientConfig};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = BearerTokenEnvironmentVariableClient::new(config).expect("Failed to build client");
    client.service_get_with_bearer_token().await;
}
