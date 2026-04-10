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
        .gettokenwithclientcredentials(
            &AuthGetTokenWithClientCredentialsRequest {
                client_id: "client_id".to_string(),
                client_secret: "client_secret".to_string(),
                audience: AuthGetTokenWithClientCredentialsRequestAudience::HttpsApiExampleCom,
                grant_type: AuthGetTokenWithClientCredentialsRequestGrantType::ClientCredentials,
                scope: None,
            },
            Some(RequestOptions::new().additional_header("X-Api-Key", "X-Api-Key")),
        )
        .await;
}
