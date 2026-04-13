use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .nullableoptional
        .searchusers(
            &SearchusersQueryRequest {
                query: "query".to_string(),
                department: Some("department".to_string()),
                role: Some("role".to_string()),
                is_active: Some(true),
            },
            None,
        )
        .await;
}
