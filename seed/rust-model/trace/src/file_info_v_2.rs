use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FileInfoV2 {
    pub filename: String,
    pub directory: String,
    pub contents: String,
    pub editable: bool,
}