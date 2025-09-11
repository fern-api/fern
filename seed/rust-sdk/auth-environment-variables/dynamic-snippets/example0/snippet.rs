use seed_auth_environment_variables::{ClientConfig, AuthEnvironmentVariablesClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<value>".to_string())
    };
    let client = AuthEnvironmentVariablesClient::new(config).expect("Failed to build client");
    client.service_get_with_api_key().await;
}
