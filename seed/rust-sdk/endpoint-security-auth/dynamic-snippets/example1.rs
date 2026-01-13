use seed_endpoint_security_auth::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = EndpointSecurityAuthClient::new(config).expect("Failed to build client");
    client.user.get_with_bearer(None).await;
}
