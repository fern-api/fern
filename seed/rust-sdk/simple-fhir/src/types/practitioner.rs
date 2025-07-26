use crate::base_resource::BaseResource;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Practitioner {
    #[serde(flatten)]
    pub base_resource_fields: BaseResource,
    pub resource_type: String,
    pub name: String,
}