use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Practitioner {
    pub resource_type: String,
    pub name: String,
}