pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseV22 {
    pub metadata: TestCaseMetadata2,
    pub implementation: TestCaseImplementationReference2,
    pub arguments: HashMap<ParameterId2, VariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expects: Option<TestCaseExpects2>,
}