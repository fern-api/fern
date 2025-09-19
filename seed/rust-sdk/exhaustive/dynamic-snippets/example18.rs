use seed_exhaustive::{ClientConfig, ExhaustiveClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = ExhaustiveClient::new(config).expect("Failed to build client");
    client.endpoints_object_get_and_return_nested_with_optional_field(serde_json::json!({"string":"string","NestedObject":{"string":"string","integer":1,"long":1000000,"double":1.1,"bool":true,"datetime":"2024-01-15T09:30:00Z","date":"2023-01-15","uuid":"d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32","base64":"SGVsbG8gd29ybGQh","list":["list","list"],"set":["set"],"map":{"1":"map"},"bigint":"1000000"}})).await;
}
