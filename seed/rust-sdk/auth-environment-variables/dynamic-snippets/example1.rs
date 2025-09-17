use seed_auth_environment_variables::{
    AuthEnvironmentVariablesClient, ClientConfig, HeaderAuthRequest,
};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<value>".to_string()),
    };
    let client = AuthEnvironmentVariablesClient::new(config).expect("Failed to build client");
    client
        .service_get_with_header(HeaderAuthRequest {
            x_endpoint_header: "X-Endpoint-Header",
        })
        .await;
}
