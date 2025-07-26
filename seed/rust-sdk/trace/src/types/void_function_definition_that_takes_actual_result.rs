use crate::parameter::Parameter;
use crate::function_implementation_for_multiple_languages::FunctionImplementationForMultipleLanguages;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionDefinitionThatTakesActualResult {
    #[serde(rename = "additionalParameters")]
    pub additional_parameters: Vec<Parameter>,
    pub code: FunctionImplementationForMultipleLanguages,
}