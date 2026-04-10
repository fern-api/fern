use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .headers
        .send(
            &HeadersSendRequest {
                query: "query".to_string(),
            },
            Some(
                RequestOptions::new()
                    .additional_header("X-Endpoint-Version", "02-12-2024")
                    .additional_header("X-Async", "true"),
            ),
        )
        .await;
}
