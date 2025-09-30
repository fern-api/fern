use seed_oauth_client_credentials::{ClientConfig, GetTokenRequest, OauthClientCredentialsClient};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = OauthClientCredentialsClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token_with_client_credentials(
            &GetTokenRequest {
                cid: "cid".to_string(),
                csr: "csr".to_string(),
                scp: "scp".to_string(),
                entity_id: "entity_id".to_string(),
                audience: "https://api.example.com".to_string(),
                grant_type: "client_credentials".to_string(),
                scope: Some("scope".to_string()),
            },
            None,
        )
        .await;
}
