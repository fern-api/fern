pub use crate::prelude::*;

/// The generated signature will include an additional param, actualResult
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionDefinitionThatTakesActualResult {
    #[serde(rename = "additionalParameters")]
    pub additional_parameters: Vec<Parameter>,
    pub code: FunctionImplementationForMultipleLanguages,
}