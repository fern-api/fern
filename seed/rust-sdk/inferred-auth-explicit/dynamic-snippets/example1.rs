use seed_inferred_auth_explicit::{ClientConfig, InferredAuthExplicitClient, RefreshTokenRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = InferredAuthExplicitClient::new(config).expect("Failed to build client");
    client
        .auth_refresh_token(RefreshTokenRequest {
            x_api_key: "X-Api-Key",
            client_id: "client_id",
            client_secret: "client_secret",
            refresh_token: "refresh_token",
            audience: "https://api.example.com",
            grant_type: "refresh_token",
            scope: Some("scope"),
        })
        .await;
}
