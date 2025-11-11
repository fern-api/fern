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
        .store_traced_workspace_v_2(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &vec![
                TraceResponseV2 {
                    submission_id: SubmissionId(
                        Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                    ),
                    line_number: 1,
                    file: TracedFile {
                        filename: "filename".to_string(),
                        directory: "directory".to_string(),
                    },
                    return_value: Some(DebugVariableValue::IntegerValue { value: 0 }),
                    expression_location: Some(ExpressionLocation {
                        start: 1,
                        offset: 1,
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
                                        DebugVariableValue::IntegerValue { value: 0 },
                                    )]),
                                },
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::IntegerValue { value: 0 },
                                    )]),
                                },
                            ],
                        }),
                    },
                    stdout: Some("stdout".to_string()),
                },
                TraceResponseV2 {
                    submission_id: SubmissionId(
                        Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                    ),
                    line_number: 1,
                    file: TracedFile {
                        filename: "filename".to_string(),
                        directory: "directory".to_string(),
                    },
                    return_value: Some(DebugVariableValue::IntegerValue { value: 0 }),
                    expression_location: Some(ExpressionLocation {
                        start: 1,
                        offset: 1,
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
                                        DebugVariableValue::IntegerValue { value: 0 },
                                    )]),
                                },
                                Scope {
                                    variables: HashMap::from([(
                                        "variables".to_string(),
                                        DebugVariableValue::IntegerValue { value: 0 },
                                    )]),
                                },
                            ],
                        }),
                    },
                    stdout: Some("stdout".to_string()),
                },
            ],
            None,
        )
        .await;
}
