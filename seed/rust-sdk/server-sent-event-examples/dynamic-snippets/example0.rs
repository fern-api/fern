use seed_server_sent_events::{ClientConfig, ServerSentEventsClient, StreamCompletionRequest};
use std::collections::HashMap;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ServerSentEventsClient::new(config).expect("Failed to build client");
    client
        .completions
        .stream(
            &StreamCompletionRequest {
                query: "foo".to_string(),
            },
            None,
        )
        .await;
}
