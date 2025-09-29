use seed_oauth_client_credentials_default::{ClientConfig, OauthClientCredentialsDefaultClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
    client.simple_get_something().await;
}
