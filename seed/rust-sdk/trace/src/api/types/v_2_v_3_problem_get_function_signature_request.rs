pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetFunctionSignatureRequest2 {
    #[serde(rename = "functionSignature")]
    pub function_signature: FunctionSignature2,
}