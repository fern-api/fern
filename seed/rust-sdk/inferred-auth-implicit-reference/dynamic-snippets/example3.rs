use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .auth
        .refreshtoken(
            &RefreshTokenRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                refresh_token: "refresh_token".to_string(),
                audience: RefreshTokenRequestAudience::HttpsApiExampleCom,
                grant_type: RefreshTokenRequestGrantType::RefreshToken,
                scope: Some("scope".to_string()),
            },
            None,
        )
        .await;
}
