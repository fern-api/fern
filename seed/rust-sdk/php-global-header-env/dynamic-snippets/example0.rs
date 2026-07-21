use seed_php_global_header_env::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = PhpGlobalHeaderEnvClient::new(config).expect("Failed to build client");
    client.service.get_with_api_version(None).await;
}
