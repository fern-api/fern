use serde::{Deserialize, Serialize};
use crate::file::File;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Directory {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub files: Option<Vec<File>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub directories: Option<Vec<Directory>>,
}