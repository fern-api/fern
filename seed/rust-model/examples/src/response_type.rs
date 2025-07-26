use serde::{Deserialize, Serialize};
use crate::type_::Type;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ResponseType {
    #[serde(rename = "type")]
    pub type_: Type,
}