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
        .get_token(
            &GetTokenAuthRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                scopes: "scopes".to_string(),
                grant_type: GetTokenAuthRequestGrantType::ClientCredentials,
                tenant: "tenant".to_string(),
                audience: None,
                optional_hint: None,
            },
            None,
        )
        .await;
}
