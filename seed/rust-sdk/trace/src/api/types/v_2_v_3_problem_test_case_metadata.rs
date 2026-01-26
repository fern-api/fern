pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestCaseMetadata2 {
    pub id: TestCaseId2,
    pub name: String,
    pub hidden: bool,
}