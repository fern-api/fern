pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsTestCaseWithExpectedResult {
    #[serde(rename = "testCase")]
    pub test_case: CommonsTestCase,
    #[serde(rename = "expectedResult")]
    pub expected_result: CommonsVariableValue,
}
