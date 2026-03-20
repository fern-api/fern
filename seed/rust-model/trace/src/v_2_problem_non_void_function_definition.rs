pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionDefinition {
    pub signature: NonVoidFunctionSignature,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages,
}