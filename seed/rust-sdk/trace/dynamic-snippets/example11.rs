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
        .migration
        .get_attempted_migrations(Some(
            RequestOptions::new()
                .additional_header("admin-key-header", "admin-key-header".to_string()),
        ))
        .await;
}
