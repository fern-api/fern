pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Movie {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
}