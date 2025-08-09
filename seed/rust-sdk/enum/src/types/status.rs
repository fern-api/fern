use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Status {
    Known,
    Unknown,
}
impl fmt::Display for Status {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Known => "Known",
            Self::Unknown => "Unknown",
        };
        write!(f, "{}", s)
    }
}
