pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum FunctionSignature2 {
        Void {
            #[serde(flatten)]
            data: VoidFunctionSignature2,
        },

        NonVoid {
            #[serde(flatten)]
            data: NonVoidFunctionSignature2,
        },

        VoidThatTakesActualResult {
            #[serde(flatten)]
            data: VoidFunctionSignatureThatTakesActualResult2,
        },
}
