pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DebugKeyValuePairs {
    pub key: DebugVariableValue,
    pub value: DebugVariableValue,
}