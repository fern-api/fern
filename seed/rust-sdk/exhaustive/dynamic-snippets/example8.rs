use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .endpoints_container
        .endpoints_container_get_and_return_map_prim_to_prim(
            &HashMap::from([("key".to_string(), "value".to_string())]),
            None,
        )
        .await;
}
