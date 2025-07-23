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
