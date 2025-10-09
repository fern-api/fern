pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetBasicSolutionFileRequest2 {
    #[serde(rename = "methodName")]
    pub method_name: String,
    pub signature: NonVoidFunctionSignature2,
}