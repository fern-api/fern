use seed_trace::{
    ClientConfig, CreateProblemError, DebugVariableValue, ExceptionInfo, ExceptionV2,
    GenericCreateProblemError, StoreTracedWorkspaceRequest, TraceClient, VariableValue,
};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;

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
        .store_traced_workspace(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &StoreTracedWorkspaceRequest {
                workspace_run_details: WorkspaceRunDetails {
                    exception_v_2: Some(ExceptionV2::Generic {
                        data: ExceptionInfo {
                            exception_type: "exceptionType".to_string(),
                            exception_message: "exceptionMessage".to_string(),
                            exception_stacktrace: "exceptionStacktrace".to_string(),
                        },
                    }),
                    exception: Some(ExceptionInfo {
                        exception_type: "exceptionType".to_string(),
                        exception_message: "exceptionMessage".to_string(),
                        exception_stacktrace: "exceptionStacktrace".to_string(),
                    }),
                    stdout: "stdout".to_string(),
                },
                trace_responses: vec![
                    TraceResponse {
                        submission_id: SubmissionId(
                            Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                        ),
                        line_number: 1,
                        return_value: Some(DebugVariableValue::IntegerValue { value: None }),
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
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                    Scope {
                                        variables: HashMap::from([(
                                            "variables".to_string(),
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                ],
                            }),
                        },
                        stdout: Some("stdout".to_string()),
                    },
                    TraceResponse {
                        submission_id: SubmissionId(
                            Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
                        ),
                        line_number: 1,
                        return_value: Some(DebugVariableValue::IntegerValue { value: None }),
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
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                    Scope {
                                        variables: HashMap::from([(
                                            "variables".to_string(),
                                            DebugVariableValue::IntegerValue { value: None },
                                        )]),
                                    },
                                ],
                            }),
                        },
                        stdout: Some("stdout".to_string()),
                    },
                ],
            },
            None,
        )
        .await;
}
