pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Dog {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "likesToWoof")]
    #[serde(default)]
    pub likes_to_woof: bool,
}