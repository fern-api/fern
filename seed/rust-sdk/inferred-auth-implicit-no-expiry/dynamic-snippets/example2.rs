use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .auth
        .refreshtoken(
            &AuthRefreshTokenRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                refresh_token: "refresh_token".to_string(),
                audience: AuthRefreshTokenRequestAudience::HttpsApiExampleCom,
                grant_type: AuthRefreshTokenRequestGrantType::RefreshToken,
                scope: None,
            },
            Some(RequestOptions::new().additional_header("X-Api-Key", "X-Api-Key")),
        )
        .await;
}
