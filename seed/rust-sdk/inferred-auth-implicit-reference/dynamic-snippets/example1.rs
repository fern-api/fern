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
        .gettokenwithclientcredentials(
            &GetTokenRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                audience: GetTokenRequestAudience::HttpsApiExampleCom,
                grant_type: GetTokenRequestGrantType::ClientCredentials,
                scope: Some("scope".to_string()),
            },
            None,
        )
        .await;
}
