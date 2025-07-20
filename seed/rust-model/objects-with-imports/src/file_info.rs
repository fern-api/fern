use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum FileInfo {
    #[serde(rename = "REGULAR")]
    Regular,
    #[serde(rename = "DIRECTORY")]
    Directory,
}