use seed_oauth_client_credentials_mandatory_auth::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = OauthClientCredentialsMandatoryAuthClient::new(config).expect("Failed to build client");
    client.nested.api.get_something(None).await;
}
