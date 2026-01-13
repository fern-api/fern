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
        .get_and_return_date(
            &NaiveDate::parse_from_str("2023-01-15", "%Y-%m-%d").unwrap(),
            None,
        )
        .await;
}
