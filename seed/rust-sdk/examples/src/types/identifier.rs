use crate::r#type::Type;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Identifier {
    pub r#type: Type,
    pub value: String,
    pub label: String,
}