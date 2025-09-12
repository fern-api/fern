use seed_trace::{ClientConfig, TraceClient, GetAttemptedMigrationsRequest};

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        api_key: Some("<token>".to_string())
    };
    let client = TraceClient::new(config).expect("Failed to build client");
    client.migration_get_attempted_migrations(GetAttemptedMigrationsRequest { admin_key_header: "admin-key-header" }).await;
}
