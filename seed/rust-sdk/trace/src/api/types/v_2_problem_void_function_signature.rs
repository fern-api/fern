pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemVoidFunctionSignature {
    pub parameters: Vec<V2ProblemParameter>,
}
