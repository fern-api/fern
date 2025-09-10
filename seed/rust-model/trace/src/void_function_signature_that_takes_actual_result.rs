use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionSignatureThatTakesActualResult {
    pub parameters: Vec<Parameter>,
    #[serde(rename = "actualResultType")]
    pub actual_result_type: VariableType,
}