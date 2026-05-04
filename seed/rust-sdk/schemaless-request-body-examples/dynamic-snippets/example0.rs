use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client.create_plant(&serde_json::json!({"name":"Venus Flytrap","species":"Dionaea muscipula","care":{"light":"full sun","water":"distilled only","humidity":"high"},"tags":["carnivorous","tropical"]}), None).await;
}
