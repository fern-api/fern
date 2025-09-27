use seed_literal::{ClientConfig, LiteralClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client.reference_send(serde_json::json!({"prompt":"You are a helpful assistant","query":"query","stream":false,"ending":"$ending","context":"You're super wise","maybeContext":"You're super wise","containerObject":{"nestedObjects":[{"literal1":"literal1","literal2":"literal2","strProp":"strProp"},{"literal1":"literal1","literal2":"literal2","strProp":"strProp"}]}})).await;
}
