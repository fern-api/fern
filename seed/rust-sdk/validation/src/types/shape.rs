use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Shape {
    #[serde(rename = "SQUARE")]
    Square,
    #[serde(rename = "CIRCLE")]
    Circle,
    #[serde(rename = "TRIANGLE")]
    Triangle,
}
impl fmt::Display for Shape {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Square => "SQUARE",
            Self::Circle => "CIRCLE",
            Self::Triangle => "TRIANGLE",
        };
        write!(f, "{}", s)
    }
}
