use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Color {
    #[serde(rename = "red")]
    Red,
    #[serde(rename = "blue")]
    Blue,
}
impl fmt::Display for Color {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Red => "red",
            Self::Blue => "blue",
        };
        write!(f, "{}", s)
    }
}
