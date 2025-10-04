pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum V2ProblemFunctionSignature {
        Void {
            #[serde(flatten)]
            data: V2ProblemVoidFunctionSignature,
        },

        NonVoid {
            #[serde(flatten)]
            data: V2ProblemNonVoidFunctionSignature,
        },

        VoidThatTakesActualResult {
            #[serde(flatten)]
            data: V2ProblemVoidFunctionSignatureThatTakesActualResult,
        },
}
