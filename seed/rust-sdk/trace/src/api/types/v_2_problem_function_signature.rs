pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum FunctionSignature {
        #[serde(rename = "void")]
        Void {
            #[serde(flatten)]
            data: VoidFunctionSignature,
        },

        #[serde(rename = "nonVoid")]
        NonVoid {
            #[serde(flatten)]
            data: NonVoidFunctionSignature,
        },

        #[serde(rename = "voidThatTakesActualResult")]
        VoidThatTakesActualResult {
            #[serde(flatten)]
            data: VoidFunctionSignatureThatTakesActualResult,
        },
}
