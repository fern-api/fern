pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Dog {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub breed: String,
    #[serde(default)]
    pub age: i64,
}