pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionDefinition2 {
    pub signature: NonVoidFunctionSignature2,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages2,
}