use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Color {
    #[serde(rename = "red")]
    Red,
    #[serde(rename = "blue")]
    Blue,
}