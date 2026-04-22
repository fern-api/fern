use seed_trace::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client
        .homepage
        .set_homepage_problems(
            &vec![
                ProblemId("string".to_string()),
                ProblemId("string".to_string()),
            ],
            None,
        )
        .await;
}
