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
                optional_prompt: Some(QuerySendRequestOptionalPrompt::YouAreAHelpfulAssistant),
                alias_prompt: AliasToPrompt::YouAreAHelpfulAssistant,
                alias_optional_prompt: Some(AliasToPrompt::YouAreAHelpfulAssistant),
                query: "query".to_string(),
                stream: true,
                optional_stream: Some(true),
                alias_stream: AliasToStream(true),
                alias_optional_stream: Some(AliasToStream(true)),
            },
            None,
        )
        .await;
}
