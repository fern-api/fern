use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionDefinition {
    pub parameters: Vec<Parameter>,
    pub code: FunctionImplementationForMultipleLanguages,
}