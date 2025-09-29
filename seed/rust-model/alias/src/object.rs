use serde::{Deserialize, Serialize};
use crate::type_::Type;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Object(pub Type);