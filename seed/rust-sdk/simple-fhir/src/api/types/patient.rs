pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Patient {
    #[serde(flatten)]
    pub base_resource_fields: BaseResource,
    pub resource_type: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub scripts: Vec<Script>,
}
