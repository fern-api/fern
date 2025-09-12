use seed_inferred_auth_implicit_no_expiry::{ClientConfig, InferredAuthImplicitNoExpiryClient, GetTokenRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = InferredAuthImplicitNoExpiryClient::new(config).expect("Failed to build client");
    client.auth_get_token_with_client_credentials(GetTokenRequest { x_api_key: "X-Api-Key", client_id: "client_id", client_secret: "client_secret", audience: "https://api.example.com", grant_type: "client_credentials", scope: Some("scope") }).await;
}
