pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2ProblemParameter {
    #[serde(rename = "parameterId")]
    pub parameter_id: V2ProblemParameterId,
    pub name: String,
    #[serde(rename = "variableType")]
    pub variable_type: CommonsVariableType,
}