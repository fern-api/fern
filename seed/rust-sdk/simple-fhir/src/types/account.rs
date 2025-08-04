use crate::patient::Patient;
use crate::practitioner::Practitioner;
use crate::base_resource::BaseResource;
use serde::{Deserialize, Serialize};

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