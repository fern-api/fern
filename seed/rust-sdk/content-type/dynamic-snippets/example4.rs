use seed_content_types::{ClientConfig, ContentTypesClient, RegularPatchRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ContentTypesClient::new(config).expect("Failed to build client");
    client
        .service_regular_patch(
            "id",
            RegularPatchRequest {
                field_1: Some("field1"),
                field_2: Some(1),
            },
        )
        .await;
}
