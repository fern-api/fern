use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .create_ast(
            &AstNode::Llm {
                data: AstNodeLlm {
                    model: "model".to_string(),
                    value_schema: Some(HashMap::from([(
                        "value_schema".to_string(),
                        serde_json::json!({"key":"value"}),
                    )])),
                    prompt: Some("prompt".to_string()),
                    ..Default::default()
                },
            },
            None,
        )
        .await;
}
