pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct FileInfoV22 {
    pub filename: String,
    pub directory: String,
    pub contents: String,
    pub editable: bool,
}
