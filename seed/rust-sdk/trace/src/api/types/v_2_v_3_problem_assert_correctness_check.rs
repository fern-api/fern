pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum AssertCorrectnessCheck2 {
        #[serde(rename = "deepEquality")]
        DeepEquality {
            #[serde(flatten)]
            data: DeepEqualityCorrectnessCheck2,
        },

        #[serde(rename = "custom")]
        Custom {
            #[serde(flatten)]
            data: VoidFunctionDefinitionThatTakesActualResult2,
        },
}
