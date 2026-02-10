pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum FunctionSignature2 {
        #[serde(rename = "void")]
        Void {
            #[serde(flatten)]
            data: VoidFunctionSignature2,
        },

        #[serde(rename = "nonVoid")]
        NonVoid {
            #[serde(flatten)]
            data: NonVoidFunctionSignature2,
        },

        #[serde(rename = "voidThatTakesActualResult")]
        VoidThatTakesActualResult {
            #[serde(flatten)]
            data: VoidFunctionSignatureThatTakesActualResult2,
        },
}
