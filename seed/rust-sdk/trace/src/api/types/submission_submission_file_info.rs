pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionSubmissionFileInfo {
    pub directory: String,
    pub filename: String,
    pub contents: String,
}
