use crate::test_case_metadata::TestCaseMetadata;
use crate::test_case_implementation_reference::TestCaseImplementationReference;
use crate::parameter_id::ParameterId;
use crate::variable_value::VariableValue;
use crate::test_case_expects::TestCaseExpects;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseV2 {
    pub metadata: TestCaseMetadata,
    pub implementation: TestCaseImplementationReference,
    pub arguments: HashMap<ParameterId, VariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expects: Option<TestCaseExpects>,
}