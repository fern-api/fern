use seed_exhaustive::prelude::*;

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
                body: "string".to_string(),
            },
            Some(
                RequestOptions::new()
                    .additional_header("X-TEST-SERVICE-HEADER", "X-TEST-SERVICE-HEADER".to_string())
                    .additional_header(
                        "X-TEST-ENDPOINT-HEADER",
                        "X-TEST-ENDPOINT-HEADER".to_string(),
                    ),
            ),
        )
        .await;
}
