pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Actress {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub id: String,
}