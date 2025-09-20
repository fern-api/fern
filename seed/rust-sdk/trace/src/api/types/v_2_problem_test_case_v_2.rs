use crate::commons_variable_value::VariableValue;
use crate::v_2_problem_parameter_id::ParameterId;
use crate::v_2_problem_test_case_expects::TestCaseExpects;
use crate::v_2_problem_test_case_implementation_reference::TestCaseImplementationReference;
use crate::v_2_problem_test_case_metadata::TestCaseMetadata;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseV2 {
    pub metadata: TestCaseMetadata,
    pub implementation: TestCaseImplementationReference,
    pub arguments: HashMap<ParameterId, VariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expects: Option<TestCaseExpects>,
}
