pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FilteredType {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_property: Option<String>,
    #[serde(default)]
    pub private_property: i64,
}