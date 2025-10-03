pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemGetGeneratedTestCaseFileRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub template: Option<V2ProblemTestCaseTemplate>,
    #[serde(rename = "testCase")]
    pub test_case: V2ProblemTestCaseV2,
}