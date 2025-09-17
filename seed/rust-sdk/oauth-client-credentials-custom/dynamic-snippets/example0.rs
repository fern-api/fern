use seed_oauth_client_credentials::{ClientConfig, GetTokenRequest, OauthClientCredentialsClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = OauthClientCredentialsClient::new(config).expect("Failed to build client");
    client
        .auth_get_token_with_client_credentials(GetTokenRequest {
            cid: "cid",
            csr: "csr",
            scp: "scp",
            entity_id: "entity_id",
            audience: "https://api.example.com",
            grant_type: "client_credentials",
            scope: Some("scope"),
        })
        .await;
}
