use seed_trace::{ClientConfig, TraceClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.admin_send_workspace_submission_update("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", serde_json::json!({"updateTime":"2024-01-15T09:30:00Z","updateInfo":{"type":"running","value":"QUEUEING_SUBMISSION"}})).await;
}
