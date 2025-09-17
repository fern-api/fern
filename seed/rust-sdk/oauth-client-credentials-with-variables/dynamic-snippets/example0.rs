use seed_oauth_client_credentials_with_variables::{
    ClientConfig, GetTokenRequest, OauthClientCredentialsWithVariablesClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client =
        OauthClientCredentialsWithVariablesClient::new(config).expect("Failed to build client");
    client
        .auth_get_token_with_client_credentials(GetTokenRequest {
            client_id: "client_id",
            client_secret: "client_secret",
            audience: "https://api.example.com",
            grant_type: "client_credentials",
            scope: Some("scope"),
        })
        .await;
}
