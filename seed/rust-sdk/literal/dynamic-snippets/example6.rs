use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .query
        .send(
            &SendQueryRequest {
                prompt: QuerySendRequestPrompt::YouAreAHelpfulAssistant,
                alias_prompt: AliasToPrompt::YouAreAHelpfulAssistant,
                query: "query".to_string(),
                stream: true,
                alias_stream: AliasToStream(true),
                optional_prompt: None,
                alias_optional_prompt: None,
                optional_stream: None,
                alias_optional_stream: None,
            },
            None,
        )
        .await;
}
