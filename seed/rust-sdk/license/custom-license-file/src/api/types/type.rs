pub use crate::prelude::*;

/// A simple type with just a name.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Type {
    #[serde(default)]
    pub name: String,
}
