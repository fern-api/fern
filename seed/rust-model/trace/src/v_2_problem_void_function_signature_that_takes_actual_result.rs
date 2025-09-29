use crate::v_2_problem_parameter::Parameter;
use crate::commons_variable_type::VariableType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoidFunctionSignatureThatTakesActualResult {
    pub parameters: Vec<Parameter>,
    #[serde(rename = "actualResultType")]
    pub actual_result_type: VariableType,
}