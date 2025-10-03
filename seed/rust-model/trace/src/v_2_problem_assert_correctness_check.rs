pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum V2ProblemAssertCorrectnessCheck {
        DeepEquality {
            #[serde(flatten)]
            data: V2ProblemDeepEqualityCorrectnessCheck,
        },

        Custom {
            #[serde(flatten)]
            data: V2ProblemVoidFunctionDefinitionThatTakesActualResult,
        },
}
