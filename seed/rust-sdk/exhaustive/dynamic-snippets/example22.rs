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
        .endpoints
        .object
        .get_and_return_with_datetime_like_string(
            &ObjectWithDatetimeLikeString {
                datetime_like_string: "2023-08-31T14:15:22Z".to_string(),
                actual_datetime: DateTime::parse_from_rfc3339("2023-08-31T14:15:22Z").unwrap(),
            },
            None,
        )
        .await;
}
