use serde::{Deserialize, Serialize};
use crate::type_::Type;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Identifier {
    #[serde(rename = "type")]
    pub type_: Type,
    pub value: String,
    pub label: String,
}