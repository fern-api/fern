use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .create_rule(
            &RuleCreateRequest {
                name: "name".to_string(),
                execution_context: RuleExecutionContext::Prod,
            },
            None,
        )
        .await;
}
