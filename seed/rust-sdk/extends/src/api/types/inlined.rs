pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Inlined {
    #[serde(default)]
    pub unique: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub docs: String,
}
