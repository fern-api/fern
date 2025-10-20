pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseWithActualResultImplementation2 {
    #[serde(rename = "getActualResult")]
    pub get_actual_result: NonVoidFunctionDefinition2,
    #[serde(rename = "assertCorrectnessCheck")]
    pub assert_correctness_check: AssertCorrectnessCheck2,
}