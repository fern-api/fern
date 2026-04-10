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
                            value: Some(1),
                        }),
                        actual_result: ActualResult::ActualResultZero(ActualResultZero {
                            r#type: ActualResultZeroType::Value,
                            value: Some(VariableValue::VariableValueZero(VariableValueZero {
                                r#type: VariableValueZeroType::IntegerValue,
                                value: Some(1),
                            })),
                        }),
                        passed: true,
                    },
                    stdout: "stdout".to_string(),
                },
                trace_responses: vec![
                    TraceResponse {
                        submission_id: SubmissionId("submissionId".to_string()),
                        line_number: 1,
                        return_value: Some(DebugVariableValue::DebugVariableValueZero(
                            DebugVariableValueZero {
                                r#type: DebugVariableValueZeroType::IntegerValue,
                                value: Some(1),
                            },
                        )),
                        expression_location: Some(ExpressionLocation {
                            start: 1,
                            offset: 1,
                            ..Default::default()
                        }),
                        stack: StackInformation {
                            num_stack_frames: 1,
                            top_stack_frame: Some(StackFrame {
                                method_name: "methodName".to_string(),
                                line_number: 1,
                                scopes: vec![
                                    Scope {
                                        variables: HashMap::from([]),
                                        ..Default::default()
                                    },
                                    Scope {
                                        variables: HashMap::from([]),
                                        ..Default::default()
                                    },
                                ],
                                ..Default::default()
                            }),
                            ..Default::default()
                        },
                        stdout: Some("stdout".to_string()),
                        ..Default::default()
                    },
                    TraceResponse {
                        submission_id: SubmissionId("submissionId".to_string()),
                        line_number: 1,
                        return_value: Some(DebugVariableValue::DebugVariableValueZero(
                            DebugVariableValueZero {
                                r#type: DebugVariableValueZeroType::IntegerValue,
                                value: Some(1),
                            },
                        )),
                        expression_location: Some(ExpressionLocation {
                            start: 1,
                            offset: 1,
                            ..Default::default()
                        }),
                        stack: StackInformation {
                            num_stack_frames: 1,
                            top_stack_frame: Some(StackFrame {
                                method_name: "methodName".to_string(),
                                line_number: 1,
                                scopes: vec![
                                    Scope {
                                        variables: HashMap::from([]),
                                        ..Default::default()
                                    },
                                    Scope {
                                        variables: HashMap::from([]),
                                        ..Default::default()
                                    },
                                ],
                                ..Default::default()
                            }),
                            ..Default::default()
                        },
                        stdout: Some("stdout".to_string()),
                        ..Default::default()
                    },
                ],
            },
            None,
        )
        .await;
}
