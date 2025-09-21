use serde::{Deserialize, Serialize};

pub type UserId = String; // TODO: Implement proper type

pub type ProblemId = String; // TODO: Implement proper type

pub type NodeId = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListType {
    pub value_type: String, // TODO: Implement proper type
    pub is_fixed_length: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MapType {
    pub key_type: String, // TODO: Implement proper type
    pub value_type: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenericValue {
    pub stringified_type: String, // TODO: Implement proper type
    pub stringified_value: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MapValue {
    pub key_value_pairs: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyValuePair {
    pub key: String, // TODO: Implement proper type
    pub value: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BinaryTreeValue {
    pub root: String, // TODO: Implement proper type
    pub nodes: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BinaryTreeNodeValue {
    pub node_id: String, // TODO: Implement proper type
    pub val: String, // TODO: Implement proper type
    pub right: String, // TODO: Implement proper type
    pub left: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BinaryTreeNodeAndTreeValue {
    pub node_id: String, // TODO: Implement proper type
    pub full_tree: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SinglyLinkedListValue {
    pub head: String, // TODO: Implement proper type
    pub nodes: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SinglyLinkedListNodeValue {
    pub node_id: String, // TODO: Implement proper type
    pub val: String, // TODO: Implement proper type
    pub next: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SinglyLinkedListNodeAndListValue {
    pub node_id: String, // TODO: Implement proper type
    pub full_list: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoublyLinkedListValue {
    pub head: String, // TODO: Implement proper type
    pub nodes: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoublyLinkedListNodeValue {
    pub node_id: String, // TODO: Implement proper type
    pub val: String, // TODO: Implement proper type
    pub next: String, // TODO: Implement proper type
    pub prev: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoublyLinkedListNodeAndListValue {
    pub node_id: String, // TODO: Implement proper type
    pub full_list: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugMapValue {
    pub key_value_pairs: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugKeyValuePairs {
    pub key: String, // TODO: Implement proper type
    pub value: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCase {
    pub id: String, // TODO: Implement proper type
    pub params: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseWithExpectedResult {
    pub test_case: String, // TODO: Implement proper type
    pub expected_result: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfo {
    pub filename: String, // TODO: Implement proper type
    pub contents: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Language {
    Java,
    Javascript,
    Python,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LangServerRequest {
    pub request: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LangServerResponse {
    pub response: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MigrationStatus {
    Running,
    Failed,
    Finished,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Migration {
    pub name: String, // TODO: Implement proper type
    pub status: String, // TODO: Implement proper type
}

pub type PlaylistId = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Playlist {
    pub playlist_id: String, // TODO: Implement proper type
    pub owner_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistCreateRequest {
    pub name: String, // TODO: Implement proper type
    pub problems: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdatePlaylistRequest {
    pub name: String, // TODO: Implement proper type
    pub problems: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReservedKeywordEnum {
    Is,
    As,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemInfo {
    pub problem_id: String, // TODO: Implement proper type
    pub problem_description: String, // TODO: Implement proper type
    pub problem_name: String, // TODO: Implement proper type
    pub problem_version: String, // TODO: Implement proper type
    pub files: String, // TODO: Implement proper type
    pub input_params: String, // TODO: Implement proper type
    pub output_type: String, // TODO: Implement proper type
    pub testcases: String, // TODO: Implement proper type
    pub method_name: String, // TODO: Implement proper type
    pub supports_custom_test_cases: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemDescription {
    pub boards: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemFiles {
    pub solution_file: String, // TODO: Implement proper type
    pub read_only_files: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariableTypeAndName {
    pub variable_type: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProblemRequest {
    pub problem_name: String, // TODO: Implement proper type
    pub problem_description: String, // TODO: Implement proper type
    pub files: String, // TODO: Implement proper type
    pub input_params: String, // TODO: Implement proper type
    pub output_type: String, // TODO: Implement proper type
    pub testcases: String, // TODO: Implement proper type
    pub method_name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateProblemResponse {
    pub problem_version: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenericCreateProblemError {
    pub message: String, // TODO: Implement proper type
    pub type_: String, // TODO: Implement proper type
    pub stacktrace: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetDefaultStarterFilesResponse {
    pub files: String, // TODO: Implement proper type
}

pub type SubmissionId = String; // TODO: Implement proper type

pub type ShareId = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitializeProblemRequest {
    pub problem_id: String, // TODO: Implement proper type
    pub problem_version: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubmitRequestV2 {
    pub submission_id: String, // TODO: Implement proper type
    pub language: String, // TODO: Implement proper type
    pub submission_files: String, // TODO: Implement proper type
    pub problem_id: String, // TODO: Implement proper type
    pub problem_version: String, // TODO: Implement proper type
    pub user_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceSubmitRequest {
    pub submission_id: String, // TODO: Implement proper type
    pub language: String, // TODO: Implement proper type
    pub submission_files: String, // TODO: Implement proper type
    pub user_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubmissionFileInfo {
    pub directory: String, // TODO: Implement proper type
    pub filename: String, // TODO: Implement proper type
    pub contents: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SubmissionTypeEnum {
    Test,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StopRequest {
    pub submission_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildingExecutorResponse {
    pub submission_id: String, // TODO: Implement proper type
    pub status: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunningResponse {
    pub submission_id: String, // TODO: Implement proper type
    pub state: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RunningSubmissionState {
    QueueingSubmission,
    KillingHistoricalSubmissions,
    WritingSubmissionToFile,
    CompilingSubmission,
    RunningSubmission,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErroredResponse {
    pub submission_id: String, // TODO: Implement proper type
    pub error_info: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompileError {
    pub message: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeError {
    pub message: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InternalError {
    pub exception_info: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoppedResponse {
    pub submission_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceRanResponse {
    pub submission_id: String, // TODO: Implement proper type
    pub run_details: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceRunDetails {
    pub exception_v_2: String, // TODO: Implement proper type
    pub exception: String, // TODO: Implement proper type
    pub stdout: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradedResponse {
    pub submission_id: String, // TODO: Implement proper type
    pub test_cases: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradedResponseV2 {
    pub submission_id: String, // TODO: Implement proper type
    pub test_cases: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseHiddenGrade {
    pub passed: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseNonHiddenGrade {
    pub passed: String, // TODO: Implement proper type
    pub actual_result: String, // TODO: Implement proper type
    pub exception: String, // TODO: Implement proper type
    pub stdout: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordedResponseNotification {
    pub submission_id: String, // TODO: Implement proper type
    pub trace_responses_size: String, // TODO: Implement proper type
    pub test_case_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordingResponseNotification {
    pub submission_id: String, // TODO: Implement proper type
    pub test_case_id: String, // TODO: Implement proper type
    pub line_number: String, // TODO: Implement proper type
    pub lightweight_stack_info: String, // TODO: Implement proper type
    pub traced_file: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightweightStackframeInformation {
    pub num_stack_frames: String, // TODO: Implement proper type
    pub top_stack_frame_method_name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseResultWithStdout {
    pub result: String, // TODO: Implement proper type
    pub stdout: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseResult {
    pub expected_result: String, // TODO: Implement proper type
    pub actual_result: String, // TODO: Implement proper type
    pub passed: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExceptionInfo {
    pub exception_type: String, // TODO: Implement proper type
    pub exception_message: String, // TODO: Implement proper type
    pub exception_stacktrace: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InvalidRequestResponse {
    pub request: String, // TODO: Implement proper type
    pub cause: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExistingSubmissionExecuting {
    pub submission_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubmissionIdNotFound {
    pub missing_submission_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomTestCasesUnsupported {
    pub problem_id: String, // TODO: Implement proper type
    pub submission_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnexpectedLanguageError {
    pub expected_language: String, // TODO: Implement proper type
    pub actual_language: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminatedResponse {
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinishedResponse {
    pub submission_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StdoutResponse {
    pub submission_id: String, // TODO: Implement proper type
    pub stdout: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StderrResponse {
    pub submission_id: String, // TODO: Implement proper type
    pub stderr: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceResponse {
    pub submission_id: String, // TODO: Implement proper type
    pub line_number: String, // TODO: Implement proper type
    pub return_value: String, // TODO: Implement proper type
    pub expression_location: String, // TODO: Implement proper type
    pub stack: String, // TODO: Implement proper type
    pub stdout: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceResponseV2 {
    pub submission_id: String, // TODO: Implement proper type
    pub line_number: String, // TODO: Implement proper type
    pub file: String, // TODO: Implement proper type
    pub return_value: String, // TODO: Implement proper type
    pub expression_location: String, // TODO: Implement proper type
    pub stack: String, // TODO: Implement proper type
    pub stdout: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TracedFile {
    pub filename: String, // TODO: Implement proper type
    pub directory: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExpressionLocation {
    pub start: String, // TODO: Implement proper type
    pub offset: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StackInformation {
    pub num_stack_frames: String, // TODO: Implement proper type
    pub top_stack_frame: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StackFrame {
    pub method_name: String, // TODO: Implement proper type
    pub line_number: String, // TODO: Implement proper type
    pub scopes: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Scope {
    pub variables: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionSessionResponse {
    pub session_id: String, // TODO: Implement proper type
    pub execution_session_url: String, // TODO: Implement proper type
    pub language: String, // TODO: Implement proper type
    pub status: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExecutionSessionStatus {
    CreatingContainer,
    ProvisioningContainer,
    PendingContainer,
    RunningContainer,
    LiveContainer,
    FailedToLaunch,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSubmissionStatusV2 {
    pub updates: String, // TODO: Implement proper type
    pub problem_id: String, // TODO: Implement proper type
    pub problem_version: String, // TODO: Implement proper type
    pub problem_info: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceSubmissionStatusV2 {
    pub updates: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSubmissionUpdate {
    pub update_time: String, // TODO: Implement proper type
    pub update_info: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceSubmissionUpdate {
    pub update_time: String, // TODO: Implement proper type
    pub update_info: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GradedTestCaseUpdate {
    pub test_case_id: String, // TODO: Implement proper type
    pub grade: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordedTestCaseUpdate {
    pub test_case_id: String, // TODO: Implement proper type
    pub trace_responses_size: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceTracedUpdate {
    pub trace_responses_size: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceSubmissionState {
    pub status: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSubmissionState {
    pub problem_id: String, // TODO: Implement proper type
    pub default_test_cases: String, // TODO: Implement proper type
    pub custom_test_cases: String, // TODO: Implement proper type
    pub status: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TracedTestCase {
    pub result: String, // TODO: Implement proper type
    pub trace_responses_size: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceResponsesPage {
    pub offset: String, // TODO: Implement proper type
    pub trace_responses: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceResponsesPageV2 {
    pub offset: String, // TODO: Implement proper type
    pub trace_responses: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetTraceResponsesPageRequest {
    pub offset: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceStarterFilesResponse {
    pub files: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceStarterFilesResponseV2 {
    pub files_by_language: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceFiles {
    pub main_file: String, // TODO: Implement proper type
    pub read_only_files: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionSessionState {
    pub last_time_contacted: String, // TODO: Implement proper type
    pub session_id: String, // TODO: Implement proper type
    pub is_warm_instance: String, // TODO: Implement proper type
    pub aws_task_id: String, // TODO: Implement proper type
    pub language: String, // TODO: Implement proper type
    pub status: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetExecutionSessionStateResponse {
    pub states: String, // TODO: Implement proper type
    pub num_warming_instances: String, // TODO: Implement proper type
    pub warming_session_ids: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetSubmissionStateResponse {
    pub time_submitted: String, // TODO: Implement proper type
    pub submission: String, // TODO: Implement proper type
    pub language: String, // TODO: Implement proper type
    pub submission_type_state: String, // TODO: Implement proper type
}

pub type TestCaseTemplateId = String; // TODO: Implement proper type

pub type TestCaseId = String; // TODO: Implement proper type

pub type ParameterId = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemInfoV2 {
    pub problem_id: String, // TODO: Implement proper type
    pub problem_description: String, // TODO: Implement proper type
    pub problem_name: String, // TODO: Implement proper type
    pub problem_version: String, // TODO: Implement proper type
    pub supported_languages: String, // TODO: Implement proper type
    pub custom_files: String, // TODO: Implement proper type
    pub generated_files: String, // TODO: Implement proper type
    pub custom_test_case_templates: String, // TODO: Implement proper type
    pub testcases: String, // TODO: Implement proper type
    pub is_public: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightweightProblemInfoV2 {
    pub problem_id: String, // TODO: Implement proper type
    pub problem_name: String, // TODO: Implement proper type
    pub problem_version: String, // TODO: Implement proper type
    pub variable_types: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProblemRequestV2 {
    pub problem_name: String, // TODO: Implement proper type
    pub problem_description: String, // TODO: Implement proper type
    pub custom_files: String, // TODO: Implement proper type
    pub custom_test_case_templates: String, // TODO: Implement proper type
    pub testcases: String, // TODO: Implement proper type
    pub supported_languages: String, // TODO: Implement proper type
    pub is_public: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseV2 {
    pub metadata: String, // TODO: Implement proper type
    pub implementation: String, // TODO: Implement proper type
    pub arguments: String, // TODO: Implement proper type
    pub expects: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseExpects {
    pub expected_stdout: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BasicTestCaseTemplate {
    pub template_id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub description: String, // TODO: Implement proper type
    pub expected_value_parameter_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseTemplate {
    pub template_id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub implementation: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseImplementation {
    pub description: String, // TODO: Implement proper type
    pub function: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseWithActualResultImplementation {
    pub get_actual_result: String, // TODO: Implement proper type
    pub assert_correctness_check: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoidFunctionDefinition {
    pub parameters: String, // TODO: Implement proper type
    pub code: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Parameter {
    pub parameter_id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub variable_type: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NonVoidFunctionDefinition {
    pub signature: String, // TODO: Implement proper type
    pub code: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoidFunctionSignature {
    pub parameters: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NonVoidFunctionSignature {
    pub parameters: String, // TODO: Implement proper type
    pub return_type: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoidFunctionSignatureThatTakesActualResult {
    pub parameters: String, // TODO: Implement proper type
    pub actual_result_type: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeepEqualityCorrectnessCheck {
    pub expected_value_parameter_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoidFunctionDefinitionThatTakesActualResult {
    pub additional_parameters: String, // TODO: Implement proper type
    pub code: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseImplementationDescription {
    pub boards: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseMetadata {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub hidden: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionImplementationForMultipleLanguages {
    pub code_by_language: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionImplementation {
    pub impl_: String, // TODO: Implement proper type
    pub imports: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedFiles {
    pub generated_test_case_files: String, // TODO: Implement proper type
    pub generated_template_files: String, // TODO: Implement proper type
    pub other: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BasicCustomFiles {
    pub method_name: String, // TODO: Implement proper type
    pub signature: String, // TODO: Implement proper type
    pub additional_files: String, // TODO: Implement proper type
    pub basic_test_case_template: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Files {
    pub files: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfoV2 {
    pub filename: String, // TODO: Implement proper type
    pub directory: String, // TODO: Implement proper type
    pub contents: String, // TODO: Implement proper type
    pub editable: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DefaultProvidedFile {
    pub file: String, // TODO: Implement proper type
    pub related_types: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetFunctionSignatureRequest {
    pub function_signature: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetFunctionSignatureResponse {
    pub function_by_language: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetBasicSolutionFileRequest {
    pub method_name: String, // TODO: Implement proper type
    pub signature: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetBasicSolutionFileResponse {
    pub solution_file_by_language: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetGeneratedTestCaseFileRequest {
    pub template: String, // TODO: Implement proper type
    pub test_case: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetGeneratedTestCaseTemplateFileRequest {
    pub template: String, // TODO: Implement proper type
}

pub type TestCaseTemplateId = String; // TODO: Implement proper type

pub type TestCaseId = String; // TODO: Implement proper type

pub type ParameterId = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProblemInfoV2 {
    pub problem_id: String, // TODO: Implement proper type
    pub problem_description: String, // TODO: Implement proper type
    pub problem_name: String, // TODO: Implement proper type
    pub problem_version: String, // TODO: Implement proper type
    pub supported_languages: String, // TODO: Implement proper type
    pub custom_files: String, // TODO: Implement proper type
    pub generated_files: String, // TODO: Implement proper type
    pub custom_test_case_templates: String, // TODO: Implement proper type
    pub testcases: String, // TODO: Implement proper type
    pub is_public: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightweightProblemInfoV2 {
    pub problem_id: String, // TODO: Implement proper type
    pub problem_name: String, // TODO: Implement proper type
    pub problem_version: String, // TODO: Implement proper type
    pub variable_types: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProblemRequestV2 {
    pub problem_name: String, // TODO: Implement proper type
    pub problem_description: String, // TODO: Implement proper type
    pub custom_files: String, // TODO: Implement proper type
    pub custom_test_case_templates: String, // TODO: Implement proper type
    pub testcases: String, // TODO: Implement proper type
    pub supported_languages: String, // TODO: Implement proper type
    pub is_public: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseV2 {
    pub metadata: String, // TODO: Implement proper type
    pub implementation: String, // TODO: Implement proper type
    pub arguments: String, // TODO: Implement proper type
    pub expects: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseExpects {
    pub expected_stdout: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BasicTestCaseTemplate {
    pub template_id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub description: String, // TODO: Implement proper type
    pub expected_value_parameter_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseTemplate {
    pub template_id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub implementation: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseImplementation {
    pub description: String, // TODO: Implement proper type
    pub function: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseWithActualResultImplementation {
    pub get_actual_result: String, // TODO: Implement proper type
    pub assert_correctness_check: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoidFunctionDefinition {
    pub parameters: String, // TODO: Implement proper type
    pub code: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Parameter {
    pub parameter_id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub variable_type: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NonVoidFunctionDefinition {
    pub signature: String, // TODO: Implement proper type
    pub code: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoidFunctionSignature {
    pub parameters: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NonVoidFunctionSignature {
    pub parameters: String, // TODO: Implement proper type
    pub return_type: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoidFunctionSignatureThatTakesActualResult {
    pub parameters: String, // TODO: Implement proper type
    pub actual_result_type: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeepEqualityCorrectnessCheck {
    pub expected_value_parameter_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoidFunctionDefinitionThatTakesActualResult {
    pub additional_parameters: String, // TODO: Implement proper type
    pub code: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseImplementationDescription {
    pub boards: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseMetadata {
    pub id: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
    pub hidden: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionImplementationForMultipleLanguages {
    pub code_by_language: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FunctionImplementation {
    pub impl_: String, // TODO: Implement proper type
    pub imports: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneratedFiles {
    pub generated_test_case_files: String, // TODO: Implement proper type
    pub generated_template_files: String, // TODO: Implement proper type
    pub other: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BasicCustomFiles {
    pub method_name: String, // TODO: Implement proper type
    pub signature: String, // TODO: Implement proper type
    pub additional_files: String, // TODO: Implement proper type
    pub basic_test_case_template: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Files {
    pub files: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfoV2 {
    pub filename: String, // TODO: Implement proper type
    pub directory: String, // TODO: Implement proper type
    pub contents: String, // TODO: Implement proper type
    pub editable: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DefaultProvidedFile {
    pub file: String, // TODO: Implement proper type
    pub related_types: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetFunctionSignatureRequest {
    pub function_signature: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetFunctionSignatureResponse {
    pub function_by_language: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetBasicSolutionFileRequest {
    pub method_name: String, // TODO: Implement proper type
    pub signature: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetBasicSolutionFileResponse {
    pub solution_file_by_language: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetGeneratedTestCaseFileRequest {
    pub template: String, // TODO: Implement proper type
    pub test_case: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetGeneratedTestCaseTemplateFileRequest {
    pub template: String, // TODO: Implement proper type
}

