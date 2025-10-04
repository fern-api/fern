pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemNonVoidFunctionDefinition {
    pub signature: V2V3ProblemNonVoidFunctionSignature,
    pub code: V2V3ProblemFunctionImplementationForMultipleLanguages,
}