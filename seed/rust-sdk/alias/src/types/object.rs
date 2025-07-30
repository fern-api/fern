use serde::{Deserialize, Serialize};
use crate::r#type::Type;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Object(pub Type);