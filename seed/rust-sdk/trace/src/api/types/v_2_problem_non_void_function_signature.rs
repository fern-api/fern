pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionSignature {
    #[serde(default)]
    pub parameters: Vec<Parameter>,
    #[serde(rename = "returnType")]
    pub return_type: VariableType,
}
