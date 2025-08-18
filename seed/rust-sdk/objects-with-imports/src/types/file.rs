use crate::file_info::FileInfo;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct File {
    pub name: String,
    pub contents: String,
    pub info: FileInfo,
}