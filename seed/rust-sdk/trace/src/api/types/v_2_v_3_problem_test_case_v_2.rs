pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemTestCaseV2 {
    pub metadata: V2V3ProblemTestCaseMetadata,
    pub implementation: V2V3ProblemTestCaseImplementationReference,
    pub arguments: HashMap<V2V3ProblemParameterId, CommonsVariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expects: Option<V2V3ProblemTestCaseExpects>,
}
