pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct User2 {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub id: i64,
}