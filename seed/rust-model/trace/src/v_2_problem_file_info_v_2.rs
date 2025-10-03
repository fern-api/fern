pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct V2ProblemFileInfoV2 {
    pub filename: String,
    pub directory: String,
    pub contents: String,
    pub editable: bool,
}