pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemTestCaseWithActualResultImplementation {
    #[serde(rename = "getActualResult")]
    pub get_actual_result: V2ProblemNonVoidFunctionDefinition,
    #[serde(rename = "assertCorrectnessCheck")]
    pub assert_correctness_check: V2ProblemAssertCorrectnessCheck,
}