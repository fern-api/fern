pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum AssertCorrectnessCheck2 {
    DeepEquality {
        #[serde(flatten)]
        data: DeepEqualityCorrectnessCheck2,
    },

    Custom {
        #[serde(flatten)]
        data: VoidFunctionDefinitionThatTakesActualResult2,
    },
}
