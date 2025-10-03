pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct NestedType {
    #[serde(flatten)]
    pub json_fields: Json,
    pub name: String,
}