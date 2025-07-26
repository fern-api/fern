use crate::test_case::TestCase;
use crate::variable_value::VariableValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseWithExpectedResult {
    #[serde(rename = "testCase")]
    pub test_case: TestCase,
    #[serde(rename = "expectedResult")]
    pub expected_result: VariableValue,
}