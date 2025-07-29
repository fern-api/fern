use crate::test_case_with_actual_result_implementation::TestCaseWithActualResultImplementation;
use crate::void_function_definition::VoidFunctionDefinition;
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
