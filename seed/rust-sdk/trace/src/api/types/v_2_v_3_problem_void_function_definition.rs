pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionDefinition2 {
    pub parameters: Vec<Parameter2>,
    pub code: FunctionImplementationForMultipleLanguages2,
}