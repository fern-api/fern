use seed_literal::{ClientConfig, LiteralClient, SendLiteralsInQueryRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client
        .query_send(SendLiteralsInQueryRequest {
            prompt: "You are a helpful assistant",
            optional_prompt: Some("You are a helpful assistant"),
            alias_prompt: "You are a helpful assistant",
            alias_optional_prompt: Some("You are a helpful assistant"),
            stream: false,
            optional_stream: Some(false),
            alias_stream: "false",
            alias_optional_stream: Some("false"),
            query: "What is the weather today",
        })
        .await;
}
