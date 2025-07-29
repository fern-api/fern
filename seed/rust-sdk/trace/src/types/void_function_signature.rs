use crate::parameter::Parameter;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionSignature {
    pub parameters: Vec<Parameter>,
}