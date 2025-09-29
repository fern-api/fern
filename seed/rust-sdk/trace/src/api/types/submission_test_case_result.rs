use crate::commons_variable_value::VariableValue;
use crate::submission_actual_result::ActualResult;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseResult {
    #[serde(rename = "expectedResult")]
    pub expected_result: VariableValue,
    #[serde(rename = "actualResult")]
    pub actual_result: ActualResult,
    pub passed: bool,
}
