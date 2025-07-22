use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Identifier {
    pub type: Type,
    pub value: String,
    pub label: String,
}