use seed_undiscriminated_union_with_response_property::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = UndiscriminatedUnionWithResponsePropertyClient::new(config)
        .expect("Failed to build client");
    client.get_union(None).await;
}
