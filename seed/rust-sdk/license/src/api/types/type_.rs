use serde::{Deserialize, Serialize};

/// A simple type with just a name.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Type {
    pub name: String,
}
