use seed_oauth_client_credentials::{ClientConfig, OauthClientCredentialsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = OauthClientCredentialsClient::new(config).expect("Failed to build client");
    client.simple_get_something().await;
}
