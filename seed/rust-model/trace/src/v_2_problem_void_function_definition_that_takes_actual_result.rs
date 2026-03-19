pub use crate::prelude::*;

/// The generated signature will include an additional param, actualResult
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionDefinitionThatTakesActualResult {
    #[serde(rename = "additionalParameters")]
    #[serde(default)]
    pub additional_parameters: Vec<Parameter>,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages,
}