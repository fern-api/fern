use seed_literal::{ClientConfig, LiteralClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {};
    let client = LiteralClient::new(config).expect("Failed to build client");
    client.reference_send(serde_json::json!({"prompt":"You are a helpful assistant","stream":false,"context":"You're super wise","query":"What is the weather today","containerObject":{"nestedObjects":[{"literal1":"literal1","literal2":"literal2","strProp":"strProp"}]}})).await;
}
