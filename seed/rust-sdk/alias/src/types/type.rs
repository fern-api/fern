use crate::type_id::TypeId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Type {
    pub id: TypeId,
    pub name: String,
}