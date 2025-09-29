use seed_exhaustive::{ClientConfig, ExhaustiveClient, PostWithObjectBody};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        api_key: Some("<token>".to_string()),
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.inlined_requests_post_with_object_bodyand_response(PostWithObjectBody { string: "string", integer: 1, nested_object: serde_json::json!({"string":"string","integer":1,"long":1000000,"double":1.1,"bool":true,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"}) }).await;
}
