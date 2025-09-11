use seed_any_auth::{ClientConfig, AnyAuthClient, GetTokenRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = AnyAuthClient::new(config).expect("Failed to build client");
    client.auth_get_token(GetTokenRequest { client_id: "client_id", client_secret: "client_secret", audience: "https://api.example.com", grant_type: "client_credentials", scope: Some("scope") }).await;
}
