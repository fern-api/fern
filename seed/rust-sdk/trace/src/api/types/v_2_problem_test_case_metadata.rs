pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestCaseMetadata {
    pub id: TestCaseId,
    pub name: String,
    pub hidden: bool,
}