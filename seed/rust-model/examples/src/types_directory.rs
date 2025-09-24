use crate::types_file::File;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Directory {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub files: Option<Vec<File>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub directories: Option<Vec<Directory>>,
}