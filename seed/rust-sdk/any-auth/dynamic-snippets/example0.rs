use seed_any_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = AnyAuthClient::new(config).expect("Failed to build client");
    client
        .auth
        .get_token(
            &GetTokenRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                audience: "https://api.example.com".to_string(),
                grant_type: GrantType::AuthorizationCode,
                scope: Some("scope".to_string()),
            },
            None,
        )
        .await;
}
