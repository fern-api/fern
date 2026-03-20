pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestCaseV2 {
    #[serde(default)]
    pub metadata: TestCaseMetadata,
    pub implementation: TestCaseImplementationReference,
    #[serde(default)]
    pub arguments: HashMap<ParameterId, VariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expects: Option<TestCaseExpects>,
}