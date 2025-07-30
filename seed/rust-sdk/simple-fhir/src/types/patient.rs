use crate::script::Script;
use crate::base_resource::BaseResource;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Patient {
    #[serde(flatten)]
    pub base_resource_fields: BaseResource,
    pub resource_type: String,
    pub name: String,
    pub scripts: Vec<Script>,
}