pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct FileInfo {
    #[serde(default)]
    pub filename: String,
    #[serde(default)]
    pub contents: String,
}