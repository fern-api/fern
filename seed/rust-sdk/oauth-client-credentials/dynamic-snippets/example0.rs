use seed_oauth_client_credentials::{ClientConfig, GetTokenRequest, OauthClientCredentialsClient};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = OauthClientCredentialsClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token_with_client_credentials(
            &GetTokenRequest {
                client_id: "my_oauth_app_123".to_string(),
                client_secret: "sk_live_abcdef123456789".to_string(),
                audience: "https://api.example.com".to_string(),
                grant_type: "client_credentials".to_string(),
                scope: Some("read:users".to_string()),
            },
            None,
        )
        .await;
}
