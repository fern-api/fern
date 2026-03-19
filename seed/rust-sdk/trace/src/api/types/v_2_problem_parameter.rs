pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Parameter {
    #[serde(rename = "parameterId")]
    #[serde(default)]
    pub parameter_id: ParameterId,
    #[serde(default)]
    pub name: String,
    #[serde(rename = "variableType")]
    pub variable_type: VariableType,
}
