pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionDefinition2 {
    #[serde(default)]
    pub parameters: Vec<Parameter2>,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages2,
}
