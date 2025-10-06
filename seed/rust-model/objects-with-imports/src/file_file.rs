pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FileFile {
    pub name: String,
    pub contents: String,
    pub info: FileFileInfo,
}