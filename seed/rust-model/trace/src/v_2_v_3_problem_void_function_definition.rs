pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemVoidFunctionDefinition {
    pub parameters: Vec<V2V3ProblemParameter>,
    pub code: V2V3ProblemFunctionImplementationForMultipleLanguages,
}
