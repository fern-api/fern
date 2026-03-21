pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Event {
    #[serde(default)]
    pub id: Id,
    #[serde(default)]
    pub name: String,
}