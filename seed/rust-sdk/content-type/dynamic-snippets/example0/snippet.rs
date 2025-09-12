use seed_content_types::{ClientConfig, ContentTypesClient, PatchProxyRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client.service_patch(PatchProxyRequest { application: Some("application"), require_auth: Some(true) }).await;
}
