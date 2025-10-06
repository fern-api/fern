pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetGeneratedTestCaseFileRequest2 {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub template: Option<TestCaseTemplate2>,
    #[serde(rename = "testCase")]
    pub test_case: TestCaseV22,
}