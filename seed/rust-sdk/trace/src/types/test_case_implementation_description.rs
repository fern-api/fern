use crate::test_case_implementation_description_board::TestCaseImplementationDescriptionBoard;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseImplementationDescription {
    pub boards: Vec<TestCaseImplementationDescriptionBoard>,
}