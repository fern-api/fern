use seed_oauth_client_credentials::{ClientConfig, GetTokenRequest, OauthClientCredentialsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = OauthClientCredentialsClient::new(config).expect("Failed to build client");
    client
        .auth_get_token_with_client_credentials(GetTokenRequest {
            client_id: "my_oauth_app_123",
            client_secret: "sk_live_abcdef123456789",
            audience: "https://api.example.com",
            grant_type: "client_credentials",
            scope: Some("read:users"),
        })
        .await;
}
