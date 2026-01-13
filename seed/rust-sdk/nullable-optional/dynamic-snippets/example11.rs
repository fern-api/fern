use seed_nullable_optional::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional
        .update_tags(
            &"userId".to_string(),
            &UpdateTagsRequest {
                tags: Some(vec!["tags".to_string(), "tags".to_string()]),
                categories: Some(vec!["categories".to_string(), "categories".to_string()]),
                labels: Some(Some(vec!["labels".to_string(), "labels".to_string()])),
            },
            None,
        )
        .await;
}
