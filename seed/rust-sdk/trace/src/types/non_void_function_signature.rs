use crate::parameter::Parameter;
use crate::variable_type::VariableType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionSignature {
    pub parameters: Vec<Parameter>,
    #[serde(rename = "returnType")]
    pub return_type: VariableType,
}