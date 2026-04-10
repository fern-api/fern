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
        .endpoints_content_type
        .endpoints_content_type_post_json_patch_content_type(
            &TypesObjectWithOptionalField {
                ..Default::default()
            },
            None,
        )
        .await;
}
