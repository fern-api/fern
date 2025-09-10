use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ANestedLiteral {
    #[serde(rename = "myLiteral")]
    pub my_literal: String,
}