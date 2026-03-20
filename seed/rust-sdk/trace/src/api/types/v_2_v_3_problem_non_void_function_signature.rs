pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionSignature2 {
    #[serde(default)]
    pub parameters: Vec<Parameter2>,
    #[serde(rename = "returnType")]
    pub return_type: VariableType,
}