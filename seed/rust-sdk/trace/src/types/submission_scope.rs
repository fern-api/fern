use crate::commons_debug_variable_value::DebugVariableValue;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Scope {
    pub variables: HashMap<String, DebugVariableValue>,
}
