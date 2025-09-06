use serde::{Deserialize, Serialize};
use crate::type_::Type;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Object(pub Type);