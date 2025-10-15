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
        .primitive
        .get_and_return_datetime(
            &DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                .unwrap()
                .with_timezone(&Utc),
            None,
        )
        .await;
}
