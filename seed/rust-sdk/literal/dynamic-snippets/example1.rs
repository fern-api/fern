use seed_literal::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client
        .headers
        .send(
            &SendLiteralsInHeadersRequest {
                endpoint_version: "02-12-2024".to_string(),
                r#async: true,
                query: "query".to_string(),
            },
            None,
        )
        .await;
}
