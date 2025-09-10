use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Shape {
    #[serde(rename = "SQUARE")]
    Square,
    #[serde(rename = "CIRCLE")]
    Circle,
    #[serde(rename = "TRIANGLE")]
    Triangle,
}