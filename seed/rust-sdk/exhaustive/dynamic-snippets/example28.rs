use seed_exhaustive::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .endpoints
        .object
        .get_and_return_with_required_nested_object(
            &ObjectWithRequiredNestedObject {
                required_string: "hello".to_string(),
                required_object: NestedObjectWithRequiredField {
                    string: "nested".to_string(),
                    nested_object: ObjectWithOptionalField {
                        ..Default::default()
                    },
                    ..Default::default()
                },
                ..Default::default()
            },
            None,
        )
        .await;
}
