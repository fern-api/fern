pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Parameter2 {
    #[serde(rename = "parameterId")]
    pub parameter_id: ParameterId2,
    pub name: String,
    #[serde(rename = "variableType")]
    pub variable_type: VariableType,
}