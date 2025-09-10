use serde::{Deserialize, Serialize};
use crate::types::base_resource::BaseResource;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Account {
    #[serde(flatten)]
    pub base_resource_fields: BaseResource,
    pub resource_type: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub patient: Option<Patient>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub practitioner: Option<Practitioner>,
}