use crate::test_case_id::TestCaseId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseMetadata {
    pub id: TestCaseId,
    pub name: String,
    pub hidden: bool,
}