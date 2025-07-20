use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetGeneratedTestCaseFileRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub template: Option<TestCaseTemplate>,
    #[serde(rename = "testCase")]
    pub test_case: TestCaseV2,
}