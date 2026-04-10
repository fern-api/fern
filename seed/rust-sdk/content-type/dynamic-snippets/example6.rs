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
                optional_string: None,
                optional_integer: None,
                optional_boolean: None,
                nullable_string: None,
            },
            None,
        )
        .await;
}
