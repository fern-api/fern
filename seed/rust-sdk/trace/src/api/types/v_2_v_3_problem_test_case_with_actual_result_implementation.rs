pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemTestCaseWithActualResultImplementation {
    #[serde(rename = "getActualResult")]
    pub get_actual_result: V2V3ProblemNonVoidFunctionDefinition,
    #[serde(rename = "assertCorrectnessCheck")]
    pub assert_correctness_check: V2V3ProblemAssertCorrectnessCheck,
}
