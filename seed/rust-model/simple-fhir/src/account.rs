use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Account {
    pub resource_type: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub patient: Option<Patient>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub practitioner: Option<Practitioner>,
}