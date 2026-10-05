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
        .get_and_return_with_mixed_required_and_optional_fields(
            &ObjectWithMixedRequiredAndOptionalFields {
                required_string: "requiredString".to_string(),
                required_integer: 1,
                optional_string: Some("optionalString".to_string()),
                required_long: 1000000,
                ..Default::default()
            },
            None,
        )
        .await;
}
