use crate::v_2_problem_test_case_implementation_description::TestCaseImplementationDescription;
use crate::v_2_problem_test_case_function::TestCaseFunction;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseImplementation {
    pub description: TestCaseImplementationDescription,
    pub function: TestCaseFunction,
}