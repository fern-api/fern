use seed_trace::{ClientConfig, TraceClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string()),
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .admin_update_workspace_submission_status(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            serde_json::json!({"type":"stopped"}),
        )
        .await;
}
