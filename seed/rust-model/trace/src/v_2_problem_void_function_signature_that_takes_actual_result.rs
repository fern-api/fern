pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemVoidFunctionSignatureThatTakesActualResult {
    pub parameters: Vec<V2ProblemParameter>,
    #[serde(rename = "actualResultType")]
    pub actual_result_type: CommonsVariableType,
}