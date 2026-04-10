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
        .storetracedworkspacev2(
            &SubmissionId("submissionId".to_string()),
            &vec![TraceResponseV2 {
                submission_id: SubmissionId("submissionId".to_string()),
                line_number: 1,
                file: TracedFile {
                    filename: "filename".to_string(),
                    directory: "directory".to_string(),
                    ..Default::default()
                },
                stack: StackInformation {
                    num_stack_frames: 1,
                    ..Default::default()
                },
                ..Default::default()
            }],
            None,
        )
        .await;
}
