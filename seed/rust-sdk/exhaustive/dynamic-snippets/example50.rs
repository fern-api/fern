use seed_exhaustive::{ClientConfig, ExhaustiveClient, ReqWithHeaders};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client
        .req_with_headers
        .get_with_custom_header(
            &ReqWithHeaders {
                x_test_service_header: "X-TEST-SERVICE-HEADER".to_string(),
                x_test_endpoint_header: "X-TEST-ENDPOINT-HEADER".to_string(),
                body: "string".to_string(),
            },
            None,
        )
        .await;
}
