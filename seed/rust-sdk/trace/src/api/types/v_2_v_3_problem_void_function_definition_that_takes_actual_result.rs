pub use crate::prelude::*;

/// The generated signature will include an additional param, actualResult
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemVoidFunctionDefinitionThatTakesActualResult {
    #[serde(rename = "additionalParameters")]
    pub additional_parameters: Vec<V2V3ProblemParameter>,
    pub code: V2V3ProblemFunctionImplementationForMultipleLanguages,
}
