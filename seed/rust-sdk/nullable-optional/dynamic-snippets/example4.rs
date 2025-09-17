use seed_nullable_optional::{ClientConfig, NullableOptionalClient, SearchUsersRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client
        .nullable_optional_search_users(SearchUsersRequest {
            query: "query",
            department: Some("department"),
            role: Some("role"),
            is_active: Some(Some(true)),
        })
        .await;
}
