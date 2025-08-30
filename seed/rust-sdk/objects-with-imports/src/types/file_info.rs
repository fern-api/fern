use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum FileInfo {
    #[serde(rename = "REGULAR")]
    Regular,
    #[serde(rename = "DIRECTORY")]
    Directory,
}
impl fmt::Display for FileInfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Regular => "REGULAR",
            Self::Directory => "DIRECTORY",
        };
        write!(f, "{}", s)
    }
}
