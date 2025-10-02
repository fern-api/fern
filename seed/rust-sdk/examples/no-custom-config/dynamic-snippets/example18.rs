use seed_examples::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client
        .service
        .get_metadata(
            &GetMetadataQueryRequest {
                shallow: Some(true),
                tag: vec![Some("tag".to_string())],
                x_api_version: "X-API-Version".to_string(),
            },
            None,
        )
        .await;
}
