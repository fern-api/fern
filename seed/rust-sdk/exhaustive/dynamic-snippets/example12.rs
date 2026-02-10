use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .http_methods
        .test_put(
            &"id".to_string(),
            &ObjectWithRequiredField {
                string: "string".to_string(),
            },
            None,
        )
        .await;
}
