use crate::v_2_problem_test_case_id::TestCaseId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestCaseMetadata {
    pub id: TestCaseId,
    pub name: String,
    pub hidden: bool,
}