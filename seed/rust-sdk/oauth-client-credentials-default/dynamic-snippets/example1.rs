use seed_oauth_client_credentials_default::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
    client.nested_no_auth.api.get_something(None).await;
}
