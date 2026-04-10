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
        .storetracedworkspace(
            &SubmissionId("submissionId".to_string()),
            &AdminStoreTracedWorkspaceRequest {
                workspace_run_details: WorkspaceRunDetails {
                    stdout: "stdout".to_string(),
                    ..Default::default()
                },
                trace_responses: vec![TraceResponse {
                    submission_id: SubmissionId("submissionId".to_string()),
                    line_number: 1,
                    stack: StackInformation {
                        num_stack_frames: 1,
                        ..Default::default()
                    },
                    ..Default::default()
                }],
            },
            None,
        )
        .await;
}
