use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionDefinition {
    pub signature: NonVoidFunctionSignature,
    pub code: FunctionImplementationForMultipleLanguages,
}