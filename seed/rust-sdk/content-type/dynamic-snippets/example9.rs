use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .regularpatch(
            &"id".to_string(),
            &ServiceRegularPatchRequest {
                field1: Some("field1".to_string()),
                field2: Some(1),
                ..Default::default()
            },
            None,
        )
        .await;
}
