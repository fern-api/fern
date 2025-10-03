pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct V2V3ProblemTestCaseMetadata {
    pub id: V2V3ProblemTestCaseId,
    pub name: String,
    pub hidden: bool,
}
