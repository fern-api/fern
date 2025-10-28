use seed_errors::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ErrorsClient::new(config).expect("Failed to build client");
    client
        .simple
        .foo_with_examples(
            &FooRequest {
                bar: "bar".to_string(),
            },
            None,
        )
        .await;
}
