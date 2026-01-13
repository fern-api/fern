use seed_bearer_token_environment_variable::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = BearerTokenEnvironmentVariableClient::new(config).expect("Failed to build client");
    client.service.get_with_bearer_token(None).await;
}
