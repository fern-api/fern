use crate::v_2_problem_parameter::Parameter;
use crate::v_2_problem_function_implementation_for_multiple_languages::FunctionImplementationForMultipleLanguages;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionDefinition {
    pub parameters: Vec<Parameter>,
    pub code: FunctionImplementationForMultipleLanguages,
}