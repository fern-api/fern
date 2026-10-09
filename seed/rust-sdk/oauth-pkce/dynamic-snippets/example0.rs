use seed_oauth_pkce::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = OauthPkceClient::new(config).expect("Failed to build client");
    client
        .oauth
        .authorize(
            &AuthorizeQueryRequest {
                response_type: "code".to_string(),
                client_id: "client_abc123".to_string(),
                redirect_uri: "https://example.com/callback".to_string(),
                code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM".to_string(),
                code_challenge_method: Some("S256".to_string()),
                scope: Some("read write".to_string()),
                state: Some("xyz".to_string()),
            },
            None,
        )
        .await;
}
