use seed_inferred_auth_explicit::{ClientConfig, GetTokenRequest, InferredAuthExplicitClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = InferredAuthExplicitClient::new(config).expect("Failed to build client");
    client
        .auth_get_token_with_client_credentials(GetTokenRequest {
            x_api_key: "X-Api-Key",
            client_id: "client_id",
            client_secret: "client_secret",
            audience: "https://api.example.com",
            grant_type: "client_credentials",
            scope: Some("scope"),
        })
        .await;
}
