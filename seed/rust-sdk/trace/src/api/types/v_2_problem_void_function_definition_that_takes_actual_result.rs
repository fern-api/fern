use crate::v_2_problem_function_implementation_for_multiple_languages::FunctionImplementationForMultipleLanguages;
use crate::v_2_problem_parameter::Parameter;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoidFunctionDefinitionThatTakesActualResult {
    #[serde(rename = "additionalParameters")]
    pub additional_parameters: Vec<Parameter>,
    pub code: FunctionImplementationForMultipleLanguages,
}
