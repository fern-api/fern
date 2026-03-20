pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Name {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub value: String,
}
