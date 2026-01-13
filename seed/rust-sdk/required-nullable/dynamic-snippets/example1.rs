use seed_api::prelude::{*};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.get_foo(&GetFooQueryRequest {
        optional_baz: Some("optional_baz".to_string()),
        optional_nullable_baz: Some(Some("optional_nullable_baz".to_string())),
        required_baz: "required_baz".to_string(),
        required_nullable_baz: Some("required_nullable_baz".to_string())
    }, None).await;
}
