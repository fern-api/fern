use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Dog {
    pub name: String,
    #[serde(rename = "likesToWoof")]
    pub likes_to_woof: bool,
}