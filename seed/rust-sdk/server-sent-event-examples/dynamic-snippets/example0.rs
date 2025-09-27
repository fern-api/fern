use seed_server_sent_events::{ClientConfig, ServerSentEventsClient, StreamCompletionRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = ServerSentEventsClient::new(config).expect("Failed to build client");
    client
        .completions_stream(StreamCompletionRequest { query: "foo" })
        .await;
}
