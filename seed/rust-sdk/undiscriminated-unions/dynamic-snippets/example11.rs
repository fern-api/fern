use seed_undiscriminated_unions::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UndiscriminatedUnionsClient::new(config).expect("Failed to build client");
    client
        .union_
        .get_with_base_properties(
            &UnionWithBaseProperties::NamedMetadata(NamedMetadata {
                name: "name".to_string(),
                value: HashMap::from([("value".to_string(), serde_json::json!({"key":"value"}))]),
                ..Default::default()
            }),
            None,
        )
        .await;
}
