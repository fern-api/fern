use seed_trace::prelude::*;
use seed_trace::{
    ActualResult, BinaryTreeNodeValue, BinaryTreeValue, CompileError, DoublyLinkedListNodeValue,
    DoublyLinkedListValue, ErrorInfo, ExceptionInfo, ExceptionV2, InternalError, KeyValuePair,
    MapValue, NodeId, RunningSubmissionState, RuntimeError, SinglyLinkedListNodeValue,
    SinglyLinkedListValue, SubmissionId, SubmissionStatusForTestCase, TestCaseGrade,
    TestCaseHiddenGrade, TestCaseNonHiddenGrade, TestCaseResult, TestCaseResultWithStdout,
    TestSubmissionStatus, TracedTestCase, VariableValue,
};

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
        .update_test_submission_status(
            &SubmissionId(Uuid::parse_str("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32").unwrap()),
            &TestSubmissionStatus::Stopped,
            None,
        )
        .await;
}
