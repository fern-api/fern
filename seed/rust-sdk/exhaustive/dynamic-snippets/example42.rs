use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_object
        .endpoints_object_get_and_return_nested_with_required_field_as_list(
            &vec![TypesNestedObjectWithRequiredField {
                string: "string".to_string(),
                nested_object: TypesObjectWithOptionalField {
                    ..Default::default()
                },
                ..Default::default()
            }],
            None,
        )
        .await;
}
