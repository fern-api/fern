use seed_examples::{ClientConfig, ExamplesClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ExamplesClient::new(config).expect("Failed to build client");
    client.service_create_movie(serde_json::json!({"id":"id","prequel":"prequel","title":"title","from":"from","rating":1.1,"type":"movie","tag":"tag","book":"book","metadata":{"metadata":{"key":"value"}},"revenue":1000000})).await;
}
