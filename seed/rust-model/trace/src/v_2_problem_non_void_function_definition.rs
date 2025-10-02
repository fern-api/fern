pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemNonVoidFunctionDefinition {
    pub signature: V2ProblemNonVoidFunctionSignature,
    pub code: V2ProblemFunctionImplementationForMultipleLanguages,
}