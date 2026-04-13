use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .service
        .optionalmergepatchtest(
            &ServiceOptionalMergePatchTestRequest {
                required_field: "requiredField".to_string(),
                optional_string: Some("optionalString".to_string()),
                optional_integer: Some(1),
                optional_boolean: Some(true),
                nullable_string: Some("nullableString".to_string()),
            },
            None,
        )
        .await;
}
