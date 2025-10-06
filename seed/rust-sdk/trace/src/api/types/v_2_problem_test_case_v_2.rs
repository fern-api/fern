pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemTestCaseV2 {
    pub metadata: V2ProblemTestCaseMetadata,
    pub implementation: V2ProblemTestCaseImplementationReference,
    pub arguments: HashMap<V2ProblemParameterId, CommonsVariableValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expects: Option<V2ProblemTestCaseExpects>,
}
