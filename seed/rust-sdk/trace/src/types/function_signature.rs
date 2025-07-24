use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum FunctionSignature {
        Void {
            #[serde(flatten)]
            data: VoidFunctionSignature,
        },

        NonVoid {
            #[serde(flatten)]
            data: NonVoidFunctionSignature,
        },

        VoidThatTakesActualResult {
            #[serde(flatten)]
            data: VoidFunctionSignatureThatTakesActualResult,
        },
}
