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
        .refresh_token(
            &RefreshTokenAuthRequest {
                refresh_token: "refresh_token".to_string(),
                grant_type: RefreshTokenAuthRequestGrantType::RefreshToken,
            },
            None,
        )
        .await;
}
