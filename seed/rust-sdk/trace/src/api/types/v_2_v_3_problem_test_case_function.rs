use crate::v_2_problem_test_case_with_actual_result_implementation::TestCaseWithActualResultImplementation;
use crate::v_2_problem_void_function_definition::VoidFunctionDefinition;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum TestCaseFunction {
    WithActualResult {
        #[serde(flatten)]
        data: TestCaseWithActualResultImplementation,
    },

    Custom {
        #[serde(flatten)]
        data: VoidFunctionDefinition,
    },
}
