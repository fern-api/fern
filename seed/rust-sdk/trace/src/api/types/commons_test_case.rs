use crate::commons_variable_value::VariableValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCase {
    pub id: String,
    pub params: Vec<VariableValue>,
}
