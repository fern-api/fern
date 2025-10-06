pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProblemVariableTypeAndName {
    #[serde(rename = "variableType")]
    pub variable_type: CommonsVariableType,
    pub name: String,
}