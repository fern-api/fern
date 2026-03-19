pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionDefinition {
    #[serde(default)]
    pub parameters: Vec<Parameter>,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages,
}