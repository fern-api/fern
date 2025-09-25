use seed_content_types::{ClientConfig, ContentTypesClient, NamedMixedPatchRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service_named_patch_with_mixed(
            "id",
            NamedMixedPatchRequest {
                app_id: Some("appId"),
                instructions: Some("instructions"),
                active: Some(true),
            },
        )
        .await;
}
