use seed_nullable_optional::{ClientConfig, ListUsersRequest, NullableOptionalClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional_list_users(ListUsersRequest {
            limit: Some(1),
            offset: Some(1),
            include_deleted: Some(true),
            sort_by: Some(Some("sortBy")),
        })
        .await;
}
