use seed_oauth_client_credentials_default::{
    ClientConfig, GetTokenRequest, OauthClientCredentialsDefaultClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = OauthClientCredentialsDefaultClient::new(config).expect("Failed to build client");
    client
        .auth_get_token(GetTokenRequest {
            client_id: "client_id",
            client_secret: "client_secret",
            grant_type: "client_credentials",
        })
        .await;
}
