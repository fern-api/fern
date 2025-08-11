use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MultipleFilterSearchRequestOperator {
    #[serde(rename = "AND")]
    And,
    #[serde(rename = "OR")]
    Or,
}
impl fmt::Display for MultipleFilterSearchRequestOperator {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::And => "AND",
            Self::Or => "OR",
        };
        write!(f, "{}", s)
    }
}
