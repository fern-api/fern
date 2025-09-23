use seed_server_sent_events::{ClientConfig, ServerSentEventsClient, StreamCompletionRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = ServerSentEventsClient::new(config).expect("Failed to build client");
    client
        .completions_stream(StreamCompletionRequest { query: "foo" })
        .await;
}
