use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseWithActualResultImplementation {
    #[serde(rename = "getActualResult")]
    pub get_actual_result: NonVoidFunctionDefinition,
    #[serde(rename = "assertCorrectnessCheck")]
    pub assert_correctness_check: AssertCorrectnessCheck,
}