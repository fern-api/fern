use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionFileInfo {
    pub directory: String,
    pub filename: String,
    pub contents: String,
}