use crate::commons_debug_variable_value::DebugVariableValue;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Scope {
    pub variables: HashMap<String, DebugVariableValue>,
}