use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .inlined
        .send(
            &InlinedSendRequest {
                prompt: InlinedSendRequestPrompt::YouAreAHelpfulAssistant,
                context: Some(InlinedSendRequestContext::YoureSuperWise),
                query: "query".to_string(),
                temperature: Some(1.1),
                stream: true,
                aliased_context: SomeAliasedLiteral::YoureSuperWise,
                maybe_context: Some(SomeAliasedLiteral::YoureSuperWise),
                object_with_literal: ATopLevelLiteral {
                    nested_literal: ANestedLiteral {
                        my_literal: ANestedLiteralMyLiteral::HowSuperCool,
                    },
                },
            },
            None,
        )
        .await;
}
