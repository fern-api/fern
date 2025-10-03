pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct V2V3ProblemFiles {
    pub files: Vec<V2V3ProblemFileInfoV2>,
}
