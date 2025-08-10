use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SubmissionTypeEnum {
    #[serde(rename = "TEST")]
    Test,
}
impl fmt::Display for SubmissionTypeEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Test => "TEST",
        };
        write!(f, "{}", s)
    }
}
