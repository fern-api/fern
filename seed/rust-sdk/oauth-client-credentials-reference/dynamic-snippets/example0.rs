use seed_oauth_client_credentials_reference::prelude::{*};
use seed_oauth_client_credentials_reference::{GetTokenRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = OauthClientCredentialsReferenceClient::new(config).expect("Failed to build client");
    client.auth.get_token(&GetTokenRequest {
        client_id: "client_id".to_string(),
        client_secret: "client_secret".to_string()
    }, None).await;
}
