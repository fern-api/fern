pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct MapType {
    #[serde(rename = "keyType")]
    pub key_type: Box<VariableType>,
    #[serde(rename = "valueType")]
    pub value_type: Box<VariableType>,
}