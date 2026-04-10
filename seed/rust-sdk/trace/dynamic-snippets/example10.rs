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
        .storetracedtestcase(
            &SubmissionId("submissionId".to_string()),
            &"testCaseId".to_string(),
            &AdminStoreTracedTestCaseRequest {
                result: TestCaseResultWithStdout {
                    result: TestCaseResult {
                        expected_result: VariableValue::VariableValueZero(VariableValueZero {
                            r#type: VariableValueZeroType::IntegerValue,
                            value: None,
                        }),
                        actual_result: ActualResult::ActualResultZero(ActualResultZero {
                            r#type: ActualResultZeroType::Value,
                            value: None,
                        }),
                        passed: true,
                    },
                    stdout: "stdout".to_string(),
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
