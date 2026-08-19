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
        .inlined_requests
        .post_with_array_body_and_headers(
            &vec!["string".to_string(), "string".to_string()],
            Some(RequestOptions::new().additional_header("X-Custom-Header", "X-Custom-Header")),
        )
        .await;
}
