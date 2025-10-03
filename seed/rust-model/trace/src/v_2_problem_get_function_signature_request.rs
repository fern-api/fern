pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemGetFunctionSignatureRequest {
    #[serde(rename = "functionSignature")]
    pub function_signature: V2ProblemFunctionSignature,
}
