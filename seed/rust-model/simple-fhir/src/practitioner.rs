pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Practitioner {
    #[serde(flatten)]
    pub base_resource_fields: BaseResource,
    pub resource_type: String,
    pub name: String,
}