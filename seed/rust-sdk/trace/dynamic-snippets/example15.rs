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
                    exception_v2: Some(ExceptionV2::ExceptionV2Zero(ExceptionV2Zero {
                        exception_info_fields: ExceptionInfo {
                            exception_type: "exceptionType".to_string(),
                            exception_message: "exceptionMessage".to_string(),
                            exception_stacktrace: "exceptionStacktrace".to_string(),
                            ..Default::default()
                        },
                        r#type: ExceptionV2ZeroType::Generic,
                    })),
                    exception: Some(ExceptionInfo {
                        exception_type: "exceptionType".to_string(),
                        exception_message: "exceptionMessage".to_string(),
                        exception_stacktrace: "exceptionStacktrace".to_string(),
                        ..Default::default()
                    }),
                    stdout: "stdout".to_string(),
                    ..Default::default()
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
