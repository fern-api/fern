use crate::variable_type::VariableType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ListType {
    #[serde(rename = "valueType")]
    pub value_type: VariableType,
    #[serde(rename = "isFixedLength")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_fixed_length: Option<bool>,
}