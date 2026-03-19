pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Cat {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub is_indoor: bool,
    #[serde(default)]
    pub lives_remaining: i64,
}