pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetBasicSolutionFileRequest {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    pub signature: NonVoidFunctionSignature,
}
