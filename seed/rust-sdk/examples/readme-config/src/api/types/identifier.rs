pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Identifier {
    pub r#type: Type,
    #[serde(default)]
    pub value: String,
    #[serde(default)]
    pub label: String,
}
