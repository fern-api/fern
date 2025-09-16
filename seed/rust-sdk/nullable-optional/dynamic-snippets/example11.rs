use seed_nullable_optional::{ClientConfig, NullableOptionalClient, UpdateTagsRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional_update_tags(
            "userId",
            UpdateTagsRequest {
                tags: Some(vec!["tags", "tags"]),
                categories: Some(vec!["categories", "categories"]),
                labels: Some(Some(vec!["labels", "labels"])),
            },
        )
        .await;
}
