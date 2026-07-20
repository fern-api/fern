use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct AdminClient {
    pub http_client: HttpClient,
}

impl AdminClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .admin
    ///         .update_test_submission_status(
    ///             &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///             &TestSubmissionStatus::Stopped,
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_test_submission_status(
        &self,
        submission_id: &SubmissionId,
        request: &TestSubmissionStatus,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/admin/store-test-submission-status/{}", submission_id.0),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .admin
    ///         .send_test_submission_update(
    ///             &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///             &TestSubmissionUpdate {
    ///                 update_time: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                 update_info: TestSubmissionUpdateInfo::Running {
    ///                     value: Default::default(),
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn send_test_submission_update(
        &self,
        submission_id: &SubmissionId,
        request: &TestSubmissionUpdate,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/admin/store-test-submission-status-v2/{}", submission_id.0),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .admin
    ///         .update_workspace_submission_status(
    ///             &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///             &WorkspaceSubmissionStatus::Stopped,
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_workspace_submission_status(
        &self,
        submission_id: &SubmissionId,
        request: &WorkspaceSubmissionStatus,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-workspace-submission-status/{}",
                    submission_id.0
                ),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .admin
    ///         .send_workspace_submission_update(
    ///             &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///             &WorkspaceSubmissionUpdate {
    ///                 update_time: DateTime::parse_from_rfc3339("2024-01-15T09:30:00Z").unwrap(),
    ///                 update_info: WorkspaceSubmissionUpdateInfo::Running {
    ///                     value: Default::default(),
    ///                 },
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn send_workspace_submission_update(
        &self,
        submission_id: &SubmissionId,
        request: &WorkspaceSubmissionUpdate,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-workspace-submission-status-v2/{}",
                    submission_id.0
                ),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .admin
    ///         .store_traced_test_case(
    ///             &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///             &"testCaseId".to_string(),
    ///             &StoreTracedTestCaseRequest {
    ///                 result: TestCaseResultWithStdout {
    ///                     result: TestCaseResult {
    ///                         expected_result: VariableValue::IntegerValue { value: 0 },
    ///                         actual_result: ActualResult::Value {
    ///                             value: VariableValue::IntegerValue { value: 0 },
    ///                         },
    ///                         passed: true,
    ///                     },
    ///                     stdout: "stdout".to_string(),
    ///                 },
    ///                 trace_responses: vec![
    ///                     TraceResponse {
    ///                         submission_id: SubmissionId(
    ///                             Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                         ),
    ///                         line_number: 1,
    ///                         return_value: Some(DebugVariableValue::IntegerValue { value: 0 }),
    ///                         expression_location: Some(ExpressionLocation {
    ///                             start: 1,
    ///                             offset: 1,
    ///                             ..Default::default()
    ///                         }),
    ///                         stack: StackInformation {
    ///                             num_stack_frames: 1,
    ///                             top_stack_frame: Some(StackFrame {
    ///                                 method_name: "methodName".to_string(),
    ///                                 line_number: 1,
    ///                                 scopes: vec![
    ///                                     Scope {
    ///                                         variables: HashMap::from([(
    ///                                             "variables".to_string(),
    ///                                             DebugVariableValue::IntegerValue { value: 0 },
    ///                                         )]),
    ///                                         ..Default::default()
    ///                                     },
    ///                                     Scope {
    ///                                         variables: HashMap::from([(
    ///                                             "variables".to_string(),
    ///                                             DebugVariableValue::IntegerValue { value: 0 },
    ///                                         )]),
    ///                                         ..Default::default()
    ///                                     },
    ///                                 ],
    ///                                 ..Default::default()
    ///                             }),
    ///                             ..Default::default()
    ///                         },
    ///                         stdout: Some("stdout".to_string()),
    ///                         ..Default::default()
    ///                     },
    ///                     TraceResponse {
    ///                         submission_id: SubmissionId(
    ///                             Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                         ),
    ///                         line_number: 1,
    ///                         return_value: Some(DebugVariableValue::IntegerValue { value: 0 }),
    ///                         expression_location: Some(ExpressionLocation {
    ///                             start: 1,
    ///                             offset: 1,
    ///                             ..Default::default()
    ///                         }),
    ///                         stack: StackInformation {
    ///                             num_stack_frames: 1,
    ///                             top_stack_frame: Some(StackFrame {
    ///                                 method_name: "methodName".to_string(),
    ///                                 line_number: 1,
    ///                                 scopes: vec![
    ///                                     Scope {
    ///                                         variables: HashMap::from([(
    ///                                             "variables".to_string(),
    ///                                             DebugVariableValue::IntegerValue { value: 0 },
    ///                                         )]),
    ///                                         ..Default::default()
    ///                                     },
    ///                                     Scope {
    ///                                         variables: HashMap::from([(
    ///                                             "variables".to_string(),
    ///                                             DebugVariableValue::IntegerValue { value: 0 },
    ///                                         )]),
    ///                                         ..Default::default()
    ///                                     },
    ///                                 ],
    ///                                 ..Default::default()
    ///                             }),
    ///                             ..Default::default()
    ///                         },
    ///                         stdout: Some("stdout".to_string()),
    ///                         ..Default::default()
    ///                     },
    ///                 ],
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn store_traced_test_case(
        &self,
        submission_id: &SubmissionId,
        test_case_id: &str,
        request: &StoreTracedTestCaseRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-test-trace/submission/{}/testCase/{}",
                    submission_id.0, test_case_id
                ),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .admin
    ///         .store_traced_test_case_v2(
    ///             &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///             &TestCaseId("testCaseId".to_string()),
    ///             &vec![
    ///                 TraceResponseV2 {
    ///                     submission_id: SubmissionId(
    ///                         Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                     ),
    ///                     line_number: 1,
    ///                     file: TracedFile {
    ///                         filename: "filename".to_string(),
    ///                         directory: "directory".to_string(),
    ///                         ..Default::default()
    ///                     },
    ///                     return_value: Some(DebugVariableValue::IntegerValue { value: 0 }),
    ///                     expression_location: Some(ExpressionLocation {
    ///                         start: 1,
    ///                         offset: 1,
    ///                         ..Default::default()
    ///                     }),
    ///                     stack: StackInformation {
    ///                         num_stack_frames: 1,
    ///                         top_stack_frame: Some(StackFrame {
    ///                             method_name: "methodName".to_string(),
    ///                             line_number: 1,
    ///                             scopes: vec![
    ///                                 Scope {
    ///                                     variables: HashMap::from([(
    ///                                         "variables".to_string(),
    ///                                         DebugVariableValue::IntegerValue { value: 0 },
    ///                                     )]),
    ///                                     ..Default::default()
    ///                                 },
    ///                                 Scope {
    ///                                     variables: HashMap::from([(
    ///                                         "variables".to_string(),
    ///                                         DebugVariableValue::IntegerValue { value: 0 },
    ///                                     )]),
    ///                                     ..Default::default()
    ///                                 },
    ///                             ],
    ///                             ..Default::default()
    ///                         }),
    ///                         ..Default::default()
    ///                     },
    ///                     stdout: Some("stdout".to_string()),
    ///                     ..Default::default()
    ///                 },
    ///                 TraceResponseV2 {
    ///                     submission_id: SubmissionId(
    ///                         Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                     ),
    ///                     line_number: 1,
    ///                     file: TracedFile {
    ///                         filename: "filename".to_string(),
    ///                         directory: "directory".to_string(),
    ///                         ..Default::default()
    ///                     },
    ///                     return_value: Some(DebugVariableValue::IntegerValue { value: 0 }),
    ///                     expression_location: Some(ExpressionLocation {
    ///                         start: 1,
    ///                         offset: 1,
    ///                         ..Default::default()
    ///                     }),
    ///                     stack: StackInformation {
    ///                         num_stack_frames: 1,
    ///                         top_stack_frame: Some(StackFrame {
    ///                             method_name: "methodName".to_string(),
    ///                             line_number: 1,
    ///                             scopes: vec![
    ///                                 Scope {
    ///                                     variables: HashMap::from([(
    ///                                         "variables".to_string(),
    ///                                         DebugVariableValue::IntegerValue { value: 0 },
    ///                                     )]),
    ///                                     ..Default::default()
    ///                                 },
    ///                                 Scope {
    ///                                     variables: HashMap::from([(
    ///                                         "variables".to_string(),
    ///                                         DebugVariableValue::IntegerValue { value: 0 },
    ///                                     )]),
    ///                                     ..Default::default()
    ///                                 },
    ///                             ],
    ///                             ..Default::default()
    ///                         }),
    ///                         ..Default::default()
    ///                     },
    ///                     stdout: Some("stdout".to_string()),
    ///                     ..Default::default()
    ///                 },
    ///             ],
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn store_traced_test_case_v2(
        &self,
        submission_id: &SubmissionId,
        test_case_id: &TestCaseId,
        request: &Vec<TraceResponseV2>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-test-trace-v2/submission/{}/testCase/{}",
                    submission_id.0, test_case_id.0
                ),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .admin
    ///         .store_traced_workspace(
    ///             &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///             &StoreTracedWorkspaceRequest {
    ///                 workspace_run_details: WorkspaceRunDetails {
    ///                     exception_v2: Some(ExceptionV2::Generic {
    ///                         data: ExceptionInfo {
    ///                             exception_type: "exceptionType".to_string(),
    ///                             exception_message: "exceptionMessage".to_string(),
    ///                             exception_stacktrace: "exceptionStacktrace".to_string(),
    ///                             ..Default::default()
    ///                         },
    ///                     }),
    ///                     exception: Some(ExceptionInfo {
    ///                         exception_type: "exceptionType".to_string(),
    ///                         exception_message: "exceptionMessage".to_string(),
    ///                         exception_stacktrace: "exceptionStacktrace".to_string(),
    ///                         ..Default::default()
    ///                     }),
    ///                     stdout: "stdout".to_string(),
    ///                     ..Default::default()
    ///                 },
    ///                 trace_responses: vec![
    ///                     TraceResponse {
    ///                         submission_id: SubmissionId(
    ///                             Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                         ),
    ///                         line_number: 1,
    ///                         return_value: Some(DebugVariableValue::IntegerValue { value: 0 }),
    ///                         expression_location: Some(ExpressionLocation {
    ///                             start: 1,
    ///                             offset: 1,
    ///                             ..Default::default()
    ///                         }),
    ///                         stack: StackInformation {
    ///                             num_stack_frames: 1,
    ///                             top_stack_frame: Some(StackFrame {
    ///                                 method_name: "methodName".to_string(),
    ///                                 line_number: 1,
    ///                                 scopes: vec![
    ///                                     Scope {
    ///                                         variables: HashMap::from([(
    ///                                             "variables".to_string(),
    ///                                             DebugVariableValue::IntegerValue { value: 0 },
    ///                                         )]),
    ///                                         ..Default::default()
    ///                                     },
    ///                                     Scope {
    ///                                         variables: HashMap::from([(
    ///                                             "variables".to_string(),
    ///                                             DebugVariableValue::IntegerValue { value: 0 },
    ///                                         )]),
    ///                                         ..Default::default()
    ///                                     },
    ///                                 ],
    ///                                 ..Default::default()
    ///                             }),
    ///                             ..Default::default()
    ///                         },
    ///                         stdout: Some("stdout".to_string()),
    ///                         ..Default::default()
    ///                     },
    ///                     TraceResponse {
    ///                         submission_id: SubmissionId(
    ///                             Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                         ),
    ///                         line_number: 1,
    ///                         return_value: Some(DebugVariableValue::IntegerValue { value: 0 }),
    ///                         expression_location: Some(ExpressionLocation {
    ///                             start: 1,
    ///                             offset: 1,
    ///                             ..Default::default()
    ///                         }),
    ///                         stack: StackInformation {
    ///                             num_stack_frames: 1,
    ///                             top_stack_frame: Some(StackFrame {
    ///                                 method_name: "methodName".to_string(),
    ///                                 line_number: 1,
    ///                                 scopes: vec![
    ///                                     Scope {
    ///                                         variables: HashMap::from([(
    ///                                             "variables".to_string(),
    ///                                             DebugVariableValue::IntegerValue { value: 0 },
    ///                                         )]),
    ///                                         ..Default::default()
    ///                                     },
    ///                                     Scope {
    ///                                         variables: HashMap::from([(
    ///                                             "variables".to_string(),
    ///                                             DebugVariableValue::IntegerValue { value: 0 },
    ///                                         )]),
    ///                                         ..Default::default()
    ///                                     },
    ///                                 ],
    ///                                 ..Default::default()
    ///                             }),
    ///                             ..Default::default()
    ///                         },
    ///                         stdout: Some("stdout".to_string()),
    ///                         ..Default::default()
    ///                     },
    ///                 ],
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn store_traced_workspace(
        &self,
        submission_id: &SubmissionId,
        request: &StoreTracedWorkspaceRequest,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-workspace-trace/submission/{}",
                    submission_id.0
                ),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// # Examples
    ///
    /// ```no_run
    /// use seed_trace::prelude::*;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     let config = ClientConfig {
    ///         token: Some("<token>".to_string()),
    ///         ..Default::default()
    ///     };
    ///     let client = TraceClient::new(config).expect("Failed to build client");
    ///     client
    ///         .admin
    ///         .store_traced_workspace_v2(
    ///             &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
    ///             &vec![
    ///                 TraceResponseV2 {
    ///                     submission_id: SubmissionId(
    ///                         Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                     ),
    ///                     line_number: 1,
    ///                     file: TracedFile {
    ///                         filename: "filename".to_string(),
    ///                         directory: "directory".to_string(),
    ///                         ..Default::default()
    ///                     },
    ///                     return_value: Some(DebugVariableValue::IntegerValue { value: 0 }),
    ///                     expression_location: Some(ExpressionLocation {
    ///                         start: 1,
    ///                         offset: 1,
    ///                         ..Default::default()
    ///                     }),
    ///                     stack: StackInformation {
    ///                         num_stack_frames: 1,
    ///                         top_stack_frame: Some(StackFrame {
    ///                             method_name: "methodName".to_string(),
    ///                             line_number: 1,
    ///                             scopes: vec![
    ///                                 Scope {
    ///                                     variables: HashMap::from([(
    ///                                         "variables".to_string(),
    ///                                         DebugVariableValue::IntegerValue { value: 0 },
    ///                                     )]),
    ///                                     ..Default::default()
    ///                                 },
    ///                                 Scope {
    ///                                     variables: HashMap::from([(
    ///                                         "variables".to_string(),
    ///                                         DebugVariableValue::IntegerValue { value: 0 },
    ///                                     )]),
    ///                                     ..Default::default()
    ///                                 },
    ///                             ],
    ///                             ..Default::default()
    ///                         }),
    ///                         ..Default::default()
    ///                     },
    ///                     stdout: Some("stdout".to_string()),
    ///                     ..Default::default()
    ///                 },
    ///                 TraceResponseV2 {
    ///                     submission_id: SubmissionId(
    ///                         Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap(),
    ///                     ),
    ///                     line_number: 1,
    ///                     file: TracedFile {
    ///                         filename: "filename".to_string(),
    ///                         directory: "directory".to_string(),
    ///                         ..Default::default()
    ///                     },
    ///                     return_value: Some(DebugVariableValue::IntegerValue { value: 0 }),
    ///                     expression_location: Some(ExpressionLocation {
    ///                         start: 1,
    ///                         offset: 1,
    ///                         ..Default::default()
    ///                     }),
    ///                     stack: StackInformation {
    ///                         num_stack_frames: 1,
    ///                         top_stack_frame: Some(StackFrame {
    ///                             method_name: "methodName".to_string(),
    ///                             line_number: 1,
    ///                             scopes: vec![
    ///                                 Scope {
    ///                                     variables: HashMap::from([(
    ///                                         "variables".to_string(),
    ///                                         DebugVariableValue::IntegerValue { value: 0 },
    ///                                     )]),
    ///                                     ..Default::default()
    ///                                 },
    ///                                 Scope {
    ///                                     variables: HashMap::from([(
    ///                                         "variables".to_string(),
    ///                                         DebugVariableValue::IntegerValue { value: 0 },
    ///                                     )]),
    ///                                     ..Default::default()
    ///                                 },
    ///                             ],
    ///                             ..Default::default()
    ///                         }),
    ///                         ..Default::default()
    ///                     },
    ///                     stdout: Some("stdout".to_string()),
    ///                     ..Default::default()
    ///                 },
    ///             ],
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn store_traced_workspace_v2(
        &self,
        submission_id: &SubmissionId,
        request: &Vec<TraceResponseV2>,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!(
                    "/admin/store-workspace-trace-v2/submission/{}",
                    submission_id.0
                ),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
