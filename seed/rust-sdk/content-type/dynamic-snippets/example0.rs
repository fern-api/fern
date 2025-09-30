use seed_content_types::{ClientConfig, ContentTypesClient, PatchProxyRequest};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service
        .patch(
            &PatchProxyRequest {
                application: Some("application".to_string()),
                require_auth: Some(true),
            },
            None,
        )
        .await;
}
