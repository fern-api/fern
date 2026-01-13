use seed_nullable_optional::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = NullableOptionalClient::new(config).expect("Failed to build client");
    client.nullable_optional.search_users(&SearchUsersQueryRequest {
        query: "query".to_string(),
        department: Some("department".to_string()),
        role: Some("role".to_string()),
        is_active: Some(Some(true))
    }, None).await;
}
