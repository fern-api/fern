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