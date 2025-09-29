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
            client_id: "client_id",
            client_secret: "client_secret",
            refresh_token: "refresh_token",
            audience: "https://api.example.com",
            grant_type: "refresh_token",
            scope: Some("scope"),
        })
        .await;
}
