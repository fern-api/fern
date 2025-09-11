use seed_trace::{ClientConfig, TraceClient, GetDefaultStarterFilesRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.problem_get_default_starter_files(GetDefaultStarterFilesRequest { input_params: vec![serde_json::json!({"variableType":{"type":"integerType"},"name":"name"}), serde_json::json!({"variableType":{"type":"integerType"},"name":"name"})], output_type: serde_json::json!({"type":"integerType"}), method_name: "methodName" }).await;
}
