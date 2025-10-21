use seed_literal::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client
        .inlined
        .send(
            &SendLiteralsInlinedRequest {
                temperature: Some(10.1),
                prompt: "You are a helpful assistant".to_string(),
                context: Some("You're super wise".to_string()),
                aliased_context: SomeAliasedLiteral("You're super wise".to_string()),
                maybe_context: Some(SomeAliasedLiteral("You're super wise".to_string())),
                object_with_literal: ATopLevelLiteral {
                    nested_literal: ANestedLiteral {
                        my_literal: "How super cool".to_string(),
                    },
                },
                stream: false,
                query: "What is the weather today".to_string(),
            },
            None,
        )
        .await;
}
