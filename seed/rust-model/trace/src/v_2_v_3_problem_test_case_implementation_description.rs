use crate::v_2_problem_test_case_implementation_description_board::TestCaseImplementationDescriptionBoard;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseImplementationDescription {
    pub boards: Vec<TestCaseImplementationDescriptionBoard>,
}