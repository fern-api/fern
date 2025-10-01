use crate::type_id::TypeId;
use serde::{Deserialize, Serialize};

/// A simple type with just a name.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Type {
    pub id: TypeId,
    pub name: String,
}
