use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Parameter {
    #[serde(rename = "parameterId")]
    pub parameter_id: ParameterId,
    pub name: String,
    #[serde(rename = "variableType")]
    pub variable_type: VariableType,
}