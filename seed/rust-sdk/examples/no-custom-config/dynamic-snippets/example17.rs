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
                shallow: Some(false),
                tag: vec![Some("development".to_string())],
                x_api_version: "0.0.1".to_string(),
            },
            None,
        )
        .await;
}
