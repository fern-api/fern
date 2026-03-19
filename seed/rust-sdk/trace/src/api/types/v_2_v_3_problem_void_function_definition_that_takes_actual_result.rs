pub use crate::prelude::*;

/// The generated signature will include an additional param, actualResult
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct VoidFunctionDefinitionThatTakesActualResult2 {
    #[serde(rename = "additionalParameters")]
    #[serde(default)]
    pub additional_parameters: Vec<Parameter2>,
    #[serde(default)]
    pub code: FunctionImplementationForMultipleLanguages2,
}
