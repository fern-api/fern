use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum Language {
    #[serde(rename = "JAVA")]
    Java,
    #[serde(rename = "JAVASCRIPT")]
    Javascript,
    #[serde(rename = "PYTHON")]
    Python,
}
impl fmt::Display for Language {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Java => "JAVA",
            Self::Javascript => "JAVASCRIPT",
            Self::Python => "PYTHON",
        };
        write!(f, "{}", s)
    }
}
