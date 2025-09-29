use crate::v_2_problem_parameter::Parameter;
use crate::commons_variable_type::VariableType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NonVoidFunctionSignature {
    pub parameters: Vec<Parameter>,
    #[serde(rename = "returnType")]
    pub return_type: VariableType,
}