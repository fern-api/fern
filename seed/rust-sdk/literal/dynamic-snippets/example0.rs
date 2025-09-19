use seed_literal::{ClientConfig, LiteralClient, SendLiteralsInHeadersRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = LiteralClient::new(config).expect("Failed to build client");
    client
        .headers_send(SendLiteralsInHeadersRequest {
            endpoint_version: "02-12-2024",
            async_: true,
            query: "What is the weather today",
        })
        .await;
}
