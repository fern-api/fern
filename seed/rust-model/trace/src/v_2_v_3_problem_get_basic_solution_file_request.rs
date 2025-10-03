pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemGetBasicSolutionFileRequest {
    #[serde(rename = "methodName")]
    pub method_name: String,
    pub signature: V2V3ProblemNonVoidFunctionSignature,
}