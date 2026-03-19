pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Cat {
    #[serde(default)]
    pub name: String,
    #[serde(rename = "likesToMeow")]
    #[serde(default)]
    pub likes_to_meow: bool,
}