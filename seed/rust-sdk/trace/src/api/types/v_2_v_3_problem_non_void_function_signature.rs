pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemNonVoidFunctionSignature {
    pub parameters: Vec<V2V3ProblemParameter>,
    #[serde(rename = "returnType")]
    pub return_type: CommonsVariableType,
}
