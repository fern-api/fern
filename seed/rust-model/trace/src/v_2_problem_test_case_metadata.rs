pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct V2ProblemTestCaseMetadata {
    pub id: V2ProblemTestCaseId,
    pub name: String,
    pub hidden: bool,
}