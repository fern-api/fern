pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum V2V3ProblemFunctionSignature {
        Void {
            #[serde(flatten)]
            data: V2V3ProblemVoidFunctionSignature,
        },

        NonVoid {
            #[serde(flatten)]
            data: V2V3ProblemNonVoidFunctionSignature,
        },

        VoidThatTakesActualResult {
            #[serde(flatten)]
            data: V2V3ProblemVoidFunctionSignatureThatTakesActualResult,
        },
}
