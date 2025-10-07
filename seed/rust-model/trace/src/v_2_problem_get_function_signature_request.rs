pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetFunctionSignatureRequest {
    #[serde(rename = "functionSignature")]
    pub function_signature: FunctionSignature,
}