use seed_oauth_client_credentials_reference::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client =
        OauthClientCredentialsReferenceClient::new(config).expect("Failed to build client");
    client.simple.get_something(None).await;
}
