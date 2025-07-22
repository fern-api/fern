use serde::{Deserialize, Serialize};
use crate::types::base_resource::BaseResource;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Practitioner {
    #[serde(flatten)]
    pub base_resource_fields: BaseResource,
    pub resource_type: String,
    pub name: String,
}