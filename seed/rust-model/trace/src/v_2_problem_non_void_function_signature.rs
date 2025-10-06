pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemNonVoidFunctionSignature {
    pub parameters: Vec<V2ProblemParameter>,
    #[serde(rename = "returnType")]
    pub return_type: CommonsVariableType,
}