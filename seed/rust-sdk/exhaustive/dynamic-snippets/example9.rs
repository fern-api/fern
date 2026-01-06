use seed_exhaustive::prelude::*;
use seed_exhaustive::WeatherReport;

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
        .enum_
        .get_and_return_enum(&WeatherReport::Sunny, None)
        .await;
}
