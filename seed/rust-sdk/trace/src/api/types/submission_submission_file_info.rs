pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct SubmissionFileInfo {
    #[serde(default)]
    pub directory: String,
    #[serde(default)]
    pub filename: String,
    #[serde(default)]
    pub contents: String,
}
