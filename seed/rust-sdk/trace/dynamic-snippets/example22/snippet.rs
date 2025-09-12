use seed_trace::{ClientConfig, TraceClient};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.problem_delete_problem("problemId").await;
}
