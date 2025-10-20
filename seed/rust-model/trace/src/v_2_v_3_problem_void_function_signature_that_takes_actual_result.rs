pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VoidFunctionSignatureThatTakesActualResult2 {
    pub parameters: Vec<Parameter2>,
    #[serde(rename = "actualResultType")]
    pub actual_result_type: VariableType,
}