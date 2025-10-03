pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemVoidFunctionSignature {
    pub parameters: Vec<V2V3ProblemParameter>,
}
