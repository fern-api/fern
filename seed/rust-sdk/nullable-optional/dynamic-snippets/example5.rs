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
        .listusers(
            &ListusersQueryRequest {
                limit: Some(1),
                offset: Some(1),
                include_deleted: Some(true),
                sort_by: Some("sortBy".to_string()),
                ..Default::default()
            },
            None,
        )
        .await;
}
