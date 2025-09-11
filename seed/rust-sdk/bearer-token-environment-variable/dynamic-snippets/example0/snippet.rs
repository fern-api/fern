use seed_bearer_token_environment_variable::{ClientConfig, BearerTokenEnvironmentVariableClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = BearerTokenEnvironmentVariableClient::new(config).expect("Failed to build client");
    client.service_get_with_bearer_token().await;
}
