pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsMapType {
    #[serde(rename = "keyType")]
    pub key_type: CommonsVariableType,
    #[serde(rename = "valueType")]
    pub value_type: CommonsVariableType,
}
