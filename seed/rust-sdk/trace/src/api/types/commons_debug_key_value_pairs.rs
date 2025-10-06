pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsDebugKeyValuePairs {
    pub key: CommonsDebugVariableValue,
    pub value: CommonsDebugVariableValue,
}
