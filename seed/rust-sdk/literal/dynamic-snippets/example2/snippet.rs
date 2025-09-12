use seed_literal::{ClientConfig, LiteralClient, SendLiteralsInlinedRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = LiteralClient::new(config).expect("Failed to build client");
    client.inlined_send(SendLiteralsInlinedRequest { temperature: Some(todo!("Unhandled primitive: DOUBLE")), prompt: "You are a helpful assistant", context: Some("You're super wise"), aliased_context: "You're super wise", maybe_context: Some("You're super wise"), object_with_literal: serde_json::json!({"nestedLiteral":{"myLiteral":"How super cool"}}), stream: false, query: "What is the weather today" }).await;
}
