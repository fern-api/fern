use crate::commons_variable_type::VariableType;
use crate::v_2_problem_parameter::Parameter;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonVoidFunctionSignature {
    pub parameters: Vec<Parameter>,
    #[serde(rename = "returnType")]
    pub return_type: VariableType,
}
