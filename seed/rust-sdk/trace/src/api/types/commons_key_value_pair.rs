pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct KeyValuePair {
    pub key: Box<VariableValue>,
    pub value: Box<VariableValue>,
}
