use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .getmetadata(
            &GetmetadataQueryRequest {
                shallow: Some(true),
                tag: vec![Some("tag".to_string())],
            },
            Some(RequestOptions::new().additional_header("X-API-Version", "apiVersion")),
        )
        .await;
}
