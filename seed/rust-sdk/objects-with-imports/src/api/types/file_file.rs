pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct File {
    pub name: String,
    pub contents: String,
    pub info: FileInfo,
}
