use crate::commons_variable_type::VariableType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariableTypeAndName {
    #[serde(rename = "variableType")]
    pub variable_type: VariableType,
    pub name: String,
}