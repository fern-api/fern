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
        .endpoints_http_methods
        .endpoints_http_methods_test_post(
            &TypesObjectWithRequiredField {
                string: "string".to_string(),
                ..Default::default()
            },
            None,
        )
        .await;
}
