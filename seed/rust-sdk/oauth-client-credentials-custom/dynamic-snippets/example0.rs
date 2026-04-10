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
            &AuthGetTokenWithClientCredentialsRequest {
                cid: "cid".to_string(),
                csr: "csr".to_string(),
                scp: "scp".to_string(),
                entity_id: "entity_id".to_string(),
                audience: AuthGetTokenWithClientCredentialsRequestAudience::HttpsApiExampleCom,
                grant_type: AuthGetTokenWithClientCredentialsRequestGrantType::ClientCredentials,
                scope: None,
            },
            None,
        )
        .await;
}
