use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .get_foo(
            &GetFooQueryRequest {
                required_baz: "required_baz".to_string(),
                required_nullable_baz: Some("required_nullable_baz".to_string()),
                optional_baz: None,
                optional_nullable_baz: None,
            },
            None,
        )
        .await;
}
