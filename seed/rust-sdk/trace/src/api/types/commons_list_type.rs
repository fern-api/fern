pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ListType {
    #[serde(rename = "valueType")]
    pub value_type: Box<VariableType>,
    /// Whether this list is fixed-size (for languages that supports fixed-size lists). Defaults to false.
    #[serde(rename = "isFixedLength")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_fixed_length: Option<bool>,
}
