use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Cat {
    pub name: String,
    #[serde(rename = "likesToMeow")]
    pub likes_to_meow: bool,
}