pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionSignatureThatTakesActualResult {
    #[serde(default)]
    pub parameters: Vec<Parameter>,
    #[serde(rename = "actualResultType")]
    pub actual_result_type: VariableType,
}