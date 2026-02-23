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
        .get_and_return_with_map_of_map(
            &ObjectWithMapOfMap {
                map: HashMap::from([(
                    "map".to_string(),
                    HashMap::from([("map".to_string(), "map".to_string())]),
                )]),
            },
            None,
        )
        .await;
}
