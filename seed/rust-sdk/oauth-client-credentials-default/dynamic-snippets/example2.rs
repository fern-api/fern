use seed_oauth_client_credentials_default::{ClientConfig, OauthClientCredentialsDefaultClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
    client.nested_api_get_something().await;
}
