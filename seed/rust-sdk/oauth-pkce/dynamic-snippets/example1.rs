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
                client_id: "client_id".to_string(),
                redirect_uri: "redirect_uri".to_string(),
                code_challenge: "code_challenge".to_string(),
                code_challenge_method: Some("S256".to_string()),
                scope: Some("scope".to_string()),
                state: Some("state".to_string()),
            },
            None,
        )
        .await;
}
