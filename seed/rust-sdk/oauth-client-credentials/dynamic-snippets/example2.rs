use seed_oauth_client_credentials::{
    ClientConfig, OauthClientCredentialsClient, RefreshTokenRequest,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = OauthClientCredentialsClient::new(config).expect("Failed to build client");
    client
        .auth_refresh_token(RefreshTokenRequest {
            client_id: "my_oauth_app_123",
            client_secret: "sk_live_abcdef123456789",
            refresh_token: "refresh_token",
            audience: "https://api.example.com",
            grant_type: "refresh_token",
            scope: Some("read:users"),
        })
        .await;
}
