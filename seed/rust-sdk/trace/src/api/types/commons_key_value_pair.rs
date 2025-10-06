pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsKeyValuePair {
    pub key: CommonsVariableValue,
    pub value: CommonsVariableValue,
}
