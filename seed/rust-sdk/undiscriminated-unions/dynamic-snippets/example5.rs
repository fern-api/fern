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
        .call(
            &Request {
                union: Some(MetadataUnion::OptionalMetadata(OptionalMetadata(Some(
                    HashMap::from([("string".to_string(), serde_json::json!({"key":"value"}))]),
                )))),
            },
            None,
        )
        .await;
}
