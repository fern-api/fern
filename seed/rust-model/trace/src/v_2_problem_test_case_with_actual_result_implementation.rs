use crate::v_2_problem_non_void_function_definition::NonVoidFunctionDefinition;
use crate::v_2_problem_assert_correctness_check::AssertCorrectnessCheck;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseWithActualResultImplementation {
    #[serde(rename = "getActualResult")]
    pub get_actual_result: NonVoidFunctionDefinition,
    #[serde(rename = "assertCorrectnessCheck")]
    pub assert_correctness_check: AssertCorrectnessCheck,
}