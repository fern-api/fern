use seed_content_types::{ClientConfig, ContentTypesClient, PatchProxyRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service_patch(PatchProxyRequest {
            application: Some("application"),
            require_auth: Some(true),
        })
        .await;
}
