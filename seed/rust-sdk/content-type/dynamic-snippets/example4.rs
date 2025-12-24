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
        .regular_patch(
            &"id".to_string(),
            &RegularPatchRequest {
                field_1: Some("field1".to_string()),
                field_2: Some(1),
                ..Default::default()
            },
            None,
        )
        .await;
}
