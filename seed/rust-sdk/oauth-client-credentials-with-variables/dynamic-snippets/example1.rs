use seed_oauth_client_credentials_with_variables::{
    ClientConfig, OauthClientCredentialsWithVariablesClient, RefreshTokenRequest,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client =
        OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
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
