use crate::commons_variable_value::VariableValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyValuePair {
    pub key: VariableValue,
    pub value: VariableValue,
}