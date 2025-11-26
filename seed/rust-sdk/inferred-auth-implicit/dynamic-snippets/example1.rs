use seed_inferred_auth_implicit::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = InferredAuthImplicitClient::new(config).expect("Failed to build client");
    client
        .auth
        .refresh_token(
            &RefreshTokenRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                refresh_token: "refresh_token".to_string(),
                audience: "https://api.example.com".to_string(),
                grant_type: "refresh_token".to_string(),
                scope: Some("scope".to_string()),
            },
            Some(RequestOptions::new().additional_header("X-Api-Key", "X-Api-Key".to_string())),
        )
        .await;
}
