use seed_header_token_environment_variable::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<value>".to_string()),
        ..Default::default()
    };
    let client = HeaderTokenEnvironmentVariableClient::new(config).expect("Failed to build client");
    client.service.get_with_bearer_token(None).await;
}
