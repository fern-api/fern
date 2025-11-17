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
                query_param_object: Some(Some(PlainObject {
                    id: Some("id".to_string()),
                    name: Some("name".to_string()),
                })),
                query_param_integer: Some(Some(1)),
                body: Some(PlainObject {
                    id: Some("id".to_string()),
                    name: Some("name".to_string()),
                }),
            },
            None,
        )
        .await;
}
