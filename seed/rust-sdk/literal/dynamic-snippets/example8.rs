use seed_literal::{
    ClientConfig, ContainerObject, LiteralClient, NestedObjectWithLiterals, SendRequest,
    SomeLiteral,
};
use std::collections::{HashMap, HashSet};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = LiteralClient::new(config).expect("Failed to build client");
    client
        .reference
        .send(
            &SendRequest {
                prompt: "You are a helpful assistant".to_string(),
                stream: false,
                context: SomeLiteral("You're super wise".to_string()),
                query: "What is the weather today".to_string(),
                container_object: ContainerObject {
                    nested_objects: vec![NestedObjectWithLiterals {
                        literal_1: "literal1".to_string(),
                        literal_2: "literal2".to_string(),
                        str_prop: "strProp".to_string(),
                    }],
                },
            },
            None,
        )
        .await;
}
