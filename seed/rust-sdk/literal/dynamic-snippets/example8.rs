use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .reference
        .send(
            &SendRequest {
                prompt: SendRequestPrompt::YouAreAHelpfulAssistant,
                query: "query".to_string(),
                stream: true,
                ending: SendRequestEnding::Ending,
                context: SomeLiteral::YoureSuperWise,
                container_object: ContainerObject {
                    nested_objects: vec![NestedObjectWithLiterals {
                        literal1: NestedObjectWithLiteralsLiteral1::Literal1,
                        literal2: NestedObjectWithLiteralsLiteral2::Literal2,
                        str_prop: "strProp".to_string(),
                    }],
                    ..Default::default()
                },
                maybe_context: None,
            },
            None,
        )
        .await;
}
