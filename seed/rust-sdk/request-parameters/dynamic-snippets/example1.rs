use seed_request_parameters::{
    ClientConfig, CreateUsernameReferencedRequest, RequestParametersClient,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
    };
    let client = RequestParametersClient::new(config).expect("Failed to build client");
    client
        .user_create_username_with_referenced_type(CreateUsernameReferencedRequest {
            tags: vec!["tags", "tags"],
            body: serde_json::json!({"username":"username","password":"password","name":"test"}),
        })
        .await;
}
