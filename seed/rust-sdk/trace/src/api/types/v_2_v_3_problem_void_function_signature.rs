pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionSignature2 {
    pub parameters: Vec<Parameter2>,
}