use seed_literal::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client
        .query
        .send(
            &SendQueryRequest {
                prompt: "You are a helpful assistant".to_string(),
                optional_prompt: Some("You are a helpful assistant".to_string()),
                alias_prompt: AliasToPrompt("You are a helpful assistant".to_string()),
                alias_optional_prompt: Some(AliasToPrompt(
                    "You are a helpful assistant".to_string(),
                )),
                query: "query".to_string(),
                stream: false,
                optional_stream: Some(false),
                alias_stream: AliasToStream(false),
                alias_optional_stream: Some(AliasToStream(false)),
            },
            None,
        )
        .await;
}
