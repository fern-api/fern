pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum AssertCorrectnessCheck {
        #[serde(rename = "deepEquality")]
        DeepEquality {
            #[serde(flatten)]
            data: DeepEqualityCorrectnessCheck,
        },

        #[serde(rename = "custom")]
        Custom {
            #[serde(flatten)]
            data: VoidFunctionDefinitionThatTakesActualResult,
        },
}
