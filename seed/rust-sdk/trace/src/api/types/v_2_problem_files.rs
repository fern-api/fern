pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Files {
    #[serde(default)]
    pub files: Vec<FileInfoV2>,
}