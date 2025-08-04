use crate::deep_equality_correctness_check::DeepEqualityCorrectnessCheck;
use crate::void_function_definition_that_takes_actual_result::VoidFunctionDefinitionThatTakesActualResult;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum AssertCorrectnessCheck {
        DeepEquality {
            #[serde(flatten)]
            data: DeepEqualityCorrectnessCheck,
        },

        Custom {
            #[serde(flatten)]
            data: VoidFunctionDefinitionThatTakesActualResult,
        },
}
