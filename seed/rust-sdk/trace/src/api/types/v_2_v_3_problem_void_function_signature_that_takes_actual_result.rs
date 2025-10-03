pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3ProblemVoidFunctionSignatureThatTakesActualResult {
    pub parameters: Vec<V2V3ProblemParameter>,
    #[serde(rename = "actualResultType")]
    pub actual_result_type: VariableType,
}
