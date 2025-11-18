use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .test_group
        .test_method_name(
            &"path_param".to_string(),
            &TestMethodNameTestGroupRequest {
                body: Some(PlainObject {
                    id: None,
                    name: None,
                }),
            },
            None,
        )
        .await;
}
