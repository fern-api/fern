use seed_api::prelude::*;

#[tokio::main]
async fn main() {
    let config = ClientConfig {
        base_url: "https://api.fern.com".to_string(),
        token: Some("<token>".to_string()),
        ..Default::default()
    };
    let client = ApiClient::new(config).expect("Failed to build client");
    client
        .admin
        .sendworkspacesubmissionupdate(
            &SubmissionId("submissionId".to_string()),
            &WorkspaceSubmissionUpdate {
                update_time: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
                update_info: WorkspaceSubmissionUpdateInfo::WorkspaceSubmissionUpdateInfoZero(
                    WorkspaceSubmissionUpdateInfoZero {
                        r#type: WorkspaceSubmissionUpdateInfoZeroType::Running,
                        value: None,
                    },
                ),
            },
            None,
        )
        .await;
}
