use seed_basic_auth_environment_variables::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        username: Some("<username>".to_string()),
        password: Some("<password>".to_string()),
        ..Default::default()
    };
    let client = BasicAuthEnvironmentVariablesClient::new(config).expect("Failed to build client");
    client.basic_auth.get_with_basic_auth(None).await;
}
