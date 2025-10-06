pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum V2V3ProblemAssertCorrectnessCheck {
    DeepEquality {
        #[serde(flatten)]
        data: V2V3ProblemDeepEqualityCorrectnessCheck,
    },

    Custom {
        #[serde(flatten)]
        data: V2V3ProblemVoidFunctionDefinitionThatTakesActualResult,
    },
}
