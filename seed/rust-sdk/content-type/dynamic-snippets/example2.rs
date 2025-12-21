use seed_content_types::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service
        .named_patch_with_mixed(
            &"id".to_string(),
            &NamedMixedPatchRequest {
                app_id: Some("appId".to_string()),
                instructions: Some("instructions".to_string()),
                active: Some(true),
                ..Default::default()
            },
            None,
        )
        .await;
}
