pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NestedType {
    #[serde(flatten)]
    pub json_fields: Json,
    #[serde(default)]
    pub name: String,
}
