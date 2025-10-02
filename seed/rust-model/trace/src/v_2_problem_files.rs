pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct V2ProblemFiles {
    pub files: Vec<V2ProblemFileInfoV2>,
}