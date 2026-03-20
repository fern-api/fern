pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct File {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub contents: String,
    pub info: FileInfo,
}