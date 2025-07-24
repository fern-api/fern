use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseResult {
    #[serde(rename = "expectedResult")]
    pub expected_result: VariableValue,
    #[serde(rename = "actualResult")]
    pub actual_result: ActualResult,
    pub passed: bool,
}