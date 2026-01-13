use seed_api::prelude::*;
use seed_api::RootObject;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .create_test(
            &RootObject {
                normal_object_fields: NormalObject {
                    normal_field: Some("normalField".to_string()),
                },
                nullable_field: Some("nullableField".to_string()),
            },
            None,
        )
        .await;
}
