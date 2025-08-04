use crate::variable_type::VariableType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VariableTypeAndName {
    #[serde(rename = "variableType")]
    pub variable_type: VariableType,
    pub name: String,
}