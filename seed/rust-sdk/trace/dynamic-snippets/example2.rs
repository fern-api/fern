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
        .admin
        .send_test_submission_update(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &TestSubmissionUpdate {
                update_time: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z")
                    .unwrap()
                    .with_timezone(&Utc),
                update_info: TestSubmissionUpdateInfo::Running {
                    value: Default::default(),
                },
            },
            None,
        )
        .await;
}
