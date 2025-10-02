pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemVoidFunctionDefinition {
    pub parameters: Vec<V2ProblemParameter>,
    pub code: V2ProblemFunctionImplementationForMultipleLanguages,
}
