use crate::api::*;
use crate::{ApiError, ClientConfig, HttpClient, RequestOptions};
use reqwest::Method;

pub struct ProblemClient {
    pub http_client: HttpClient,
}

impl ProblemClient {
    pub fn new(config: ClientConfig) -> Result<Self, ApiError> {
        Ok(Self {
            http_client: HttpClient::new(config.clone())?,
        })
    }

    /// Creates a problem
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
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
    ///         .problem
    ///         .create_problem(
    ///             &CreateProblemRequest {
    ///                 problem_name: "problemName".to_string(),
    ///                 problem_description: ProblemDescription {
    ///                     boards: vec![
    ///                         ProblemDescriptionBoard::Html {
    ///                             value: "value".to_string(),
    ///                         },
    ///                         ProblemDescriptionBoard::Html {
    ///                             value: "value".to_string(),
    ///                         },
    ///                     ],
    ///                     ..Default::default()
    ///                 },
    ///                 files: HashMap::from([(
    ///                     Language::Java,
    ///                     ProblemFiles {
    ///                         solution_file: FileInfo {
    ///                             filename: "filename".to_string(),
    ///                             contents: "contents".to_string(),
    ///                             ..Default::default()
    ///                         },
    ///                         read_only_files: vec![
    ///                             FileInfo {
    ///                                 filename: "filename".to_string(),
    ///                                 contents: "contents".to_string(),
    ///                                 ..Default::default()
    ///                             },
    ///                             FileInfo {
    ///                                 filename: "filename".to_string(),
    ///                                 contents: "contents".to_string(),
    ///                                 ..Default::default()
    ///                             },
    ///                         ],
    ///                         ..Default::default()
    ///                     },
    ///                 )]),
    ///                 input_params: vec![
    ///                     VariableTypeAndName {
    ///                         variable_type: VariableType::IntegerType,
    ///                         name: "name".to_string(),
    ///                     },
    ///                     VariableTypeAndName {
    ///                         variable_type: VariableType::IntegerType,
    ///                         name: "name".to_string(),
    ///                     },
    ///                 ],
    ///                 output_type: VariableType::IntegerType,
    ///                 testcases: vec![
    ///                     TestCaseWithExpectedResult {
    ///                         test_case: TestCase {
    ///                             id: "id".to_string(),
    ///                             params: vec![
    ///                                 VariableValue::IntegerValue { value: 0 },
    ///                                 VariableValue::IntegerValue { value: 0 },
    ///                             ],
    ///                             ..Default::default()
    ///                         },
    ///                         expected_result: VariableValue::IntegerValue { value: 0 },
    ///                     },
    ///                     TestCaseWithExpectedResult {
    ///                         test_case: TestCase {
    ///                             id: "id".to_string(),
    ///                             params: vec![
    ///                                 VariableValue::IntegerValue { value: 0 },
    ///                                 VariableValue::IntegerValue { value: 0 },
    ///                             ],
    ///                             ..Default::default()
    ///                         },
    ///                         expected_result: VariableValue::IntegerValue { value: 0 },
    ///                     },
    ///                 ],
    ///                 method_name: "methodName".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn create_problem(
        &self,
        request: &CreateProblemRequest,
        options: Option<RequestOptions>,
    ) -> Result<CreateProblemResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/problem-crud/create",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Updates a problem
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
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
    ///         .problem
    ///         .update_problem(
    ///             &ProblemId("problemId".to_string()),
    ///             &CreateProblemRequest {
    ///                 problem_name: "problemName".to_string(),
    ///                 problem_description: ProblemDescription {
    ///                     boards: vec![
    ///                         ProblemDescriptionBoard::Html {
    ///                             value: "value".to_string(),
    ///                         },
    ///                         ProblemDescriptionBoard::Html {
    ///                             value: "value".to_string(),
    ///                         },
    ///                     ],
    ///                     ..Default::default()
    ///                 },
    ///                 files: HashMap::from([(
    ///                     Language::Java,
    ///                     ProblemFiles {
    ///                         solution_file: FileInfo {
    ///                             filename: "filename".to_string(),
    ///                             contents: "contents".to_string(),
    ///                             ..Default::default()
    ///                         },
    ///                         read_only_files: vec![
    ///                             FileInfo {
    ///                                 filename: "filename".to_string(),
    ///                                 contents: "contents".to_string(),
    ///                                 ..Default::default()
    ///                             },
    ///                             FileInfo {
    ///                                 filename: "filename".to_string(),
    ///                                 contents: "contents".to_string(),
    ///                                 ..Default::default()
    ///                             },
    ///                         ],
    ///                         ..Default::default()
    ///                     },
    ///                 )]),
    ///                 input_params: vec![
    ///                     VariableTypeAndName {
    ///                         variable_type: VariableType::IntegerType,
    ///                         name: "name".to_string(),
    ///                     },
    ///                     VariableTypeAndName {
    ///                         variable_type: VariableType::IntegerType,
    ///                         name: "name".to_string(),
    ///                     },
    ///                 ],
    ///                 output_type: VariableType::IntegerType,
    ///                 testcases: vec![
    ///                     TestCaseWithExpectedResult {
    ///                         test_case: TestCase {
    ///                             id: "id".to_string(),
    ///                             params: vec![
    ///                                 VariableValue::IntegerValue { value: 0 },
    ///                                 VariableValue::IntegerValue { value: 0 },
    ///                             ],
    ///                             ..Default::default()
    ///                         },
    ///                         expected_result: VariableValue::IntegerValue { value: 0 },
    ///                     },
    ///                     TestCaseWithExpectedResult {
    ///                         test_case: TestCase {
    ///                             id: "id".to_string(),
    ///                             params: vec![
    ///                                 VariableValue::IntegerValue { value: 0 },
    ///                                 VariableValue::IntegerValue { value: 0 },
    ///                             ],
    ///                             ..Default::default()
    ///                         },
    ///                         expected_result: VariableValue::IntegerValue { value: 0 },
    ///                     },
    ///                 ],
    ///                 method_name: "methodName".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn update_problem(
        &self,
        problem_id: &ProblemId,
        request: &CreateProblemRequest,
        options: Option<RequestOptions>,
    ) -> Result<UpdateProblemResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                &format!("/problem-crud/update/{}", problem_id.0),
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }

    /// Soft deletes a problem
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// Empty response
    ///
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
    ///         .problem
    ///         .delete_problem(&ProblemId("problemId".to_string()), None)
    ///         .await;
    /// }
    /// ```
    pub async fn delete_problem(
        &self,
        problem_id: &ProblemId,
        options: Option<RequestOptions>,
    ) -> Result<(), ApiError> {
        self.http_client
            .execute_request(
                Method::DELETE,
                &format!("/problem-crud/delete/{}", problem_id.0),
                None,
                None,
                options,
            )
            .await
    }

    /// Returns default starter files for problem
    ///
    /// # Arguments
    ///
    /// * `options` - Additional request options such as headers, timeout, etc.
    ///
    /// # Returns
    ///
    /// JSON response from the API
    ///
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
    ///         .problem
    ///         .get_default_starter_files(
    ///             &GetDefaultStarterFilesRequest {
    ///                 input_params: vec![
    ///                     VariableTypeAndName {
    ///                         variable_type: VariableType::IntegerType,
    ///                         name: "name".to_string(),
    ///                     },
    ///                     VariableTypeAndName {
    ///                         variable_type: VariableType::IntegerType,
    ///                         name: "name".to_string(),
    ///                     },
    ///                 ],
    ///                 output_type: VariableType::IntegerType,
    ///                 method_name: "methodName".to_string(),
    ///             },
    ///             None,
    ///         )
    ///         .await;
    /// }
    /// ```
    pub async fn get_default_starter_files(
        &self,
        request: &GetDefaultStarterFilesRequest,
        options: Option<RequestOptions>,
    ) -> Result<GetDefaultStarterFilesResponse, ApiError> {
        self.http_client
            .execute_request(
                Method::POST,
                "/problem-crud/default-starter-files",
                Some(serde_json::to_value(request).map_err(ApiError::Serialization)?),
                None,
                options,
            )
            .await
    }
}
