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
                query: "query".to_string(),
                stream: true,
                aliased_context: SomeAliasedLiteral::YoureSuperWise,
                object_with_literal: ATopLevelLiteral {
                    nested_literal: ANestedLiteral {
                        my_literal: ANestedLiteralMyLiteral::HowSuperCool,
                    },
                },
                context: None,
                temperature: None,
                maybe_context: None,
            },
            None,
        )
        .await;
}
