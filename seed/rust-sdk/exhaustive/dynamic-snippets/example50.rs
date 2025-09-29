use seed_exhaustive::{ClientConfig, ExhaustiveClient, ReqWithHeaders};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .req_with_headers_get_with_custom_header(ReqWithHeaders {
            x_test_service_header: "X-TEST-SERVICE-HEADER",
            x_test_endpoint_header: "X-TEST-ENDPOINT-HEADER",
            body: "string",
        })
        .await;
}
