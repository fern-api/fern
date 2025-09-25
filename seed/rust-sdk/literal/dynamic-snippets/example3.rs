use seed_literal::{ClientConfig, LiteralClient, SendLiteralsInlinedRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client.inlined_send(SendLiteralsInlinedRequest { prompt: "You are a helpful assistant", context: Some("You're super wise"), query: "query", temperature: Some(todo!("Unhandled primitive: DOUBLE")), stream: false, aliased_context: "You're super wise", maybe_context: Some("You're super wise"), object_with_literal: serde_json::json!({"nestedLiteral":{"myLiteral":"How super cool"}}) }).await;
}
