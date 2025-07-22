use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Patient {
    pub resource_type: String,
    pub name: String,
    pub scripts: Vec<Script>,
}