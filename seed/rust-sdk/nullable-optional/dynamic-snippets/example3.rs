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
        .list_users(
            &ListUsersQueryRequest {
                limit: Some(1),
                offset: Some(1),
                include_deleted: Some(true),
                sort_by: Some(Some("sortBy".to_string())),
                ..Default::default()
            },
            None,
        )
        .await;
}
