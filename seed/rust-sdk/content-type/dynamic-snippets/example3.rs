use seed_content_types::{ClientConfig, ContentTypesClient, OptionalMergePatchRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service_optional_merge_patch_test(OptionalMergePatchRequest {
            required_field: "requiredField",
            optional_string: Some("optionalString"),
            optional_integer: Some(1),
            optional_boolean: Some(true),
            nullable_string: Some("nullableString"),
        })
        .await;
}
