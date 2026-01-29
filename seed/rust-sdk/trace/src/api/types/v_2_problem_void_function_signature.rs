pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionSignature {
    pub parameters: Vec<Parameter>,
}