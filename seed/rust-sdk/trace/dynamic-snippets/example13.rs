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
        .storetracedtestcasev2(
            &SubmissionId("submissionId".to_string()),
            &V2TestCaseId("testCaseId".to_string()),
            &vec![
                TraceResponseV2 {
                    submission_id: SubmissionId("submissionId".to_string()),
                    line_number: 1,
                    file: TracedFile {
                        filename: "filename".to_string(),
                        directory: "directory".to_string(),
                        ..Default::default()
                    },
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
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::DebugVariableValueZero(
                                            DebugVariableValueZero {
                                                r#type: DebugVariableValueZeroType::IntegerValue,
                                                value: None,
                                            },
                                        ),
                                    )]),
                                    ..Default::default()
                                },
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::DebugVariableValueZero(
                                            DebugVariableValueZero {
                                                r#type: DebugVariableValueZeroType::IntegerValue,
                                                value: None,
                                            },
                                        ),
                                    )]),
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
                TraceResponseV2 {
                    submission_id: SubmissionId("submissionId".to_string()),
                    line_number: 1,
                    file: TracedFile {
                        filename: "filename".to_string(),
                        directory: "directory".to_string(),
                        ..Default::default()
                    },
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
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::DebugVariableValueZero(
                                            DebugVariableValueZero {
                                                r#type: DebugVariableValueZeroType::IntegerValue,
                                                value: None,
                                            },
                                        ),
                                    )]),
                                    ..Default::default()
                                },
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::DebugVariableValueZero(
                                            DebugVariableValueZero {
                                                r#type: DebugVariableValueZeroType::IntegerValue,
                                                value: None,
                                            },
                                        ),
                                    )]),
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
            None,
        )
        .await;
}
