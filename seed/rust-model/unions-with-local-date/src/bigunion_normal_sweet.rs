pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct NormalSweet {
    #[serde(default)]
    pub value: String,
}