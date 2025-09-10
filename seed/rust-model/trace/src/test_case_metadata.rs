use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseMetadata {
    pub id: TestCaseId,
    pub name: String,
    pub hidden: bool,
}