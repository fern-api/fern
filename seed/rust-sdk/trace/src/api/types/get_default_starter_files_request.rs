use crate::commons_variable_type::VariableType;
use crate::problem_variable_type_and_name::VariableTypeAndName;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GetDefaultStarterFilesRequest {
    #[serde(rename = "inputParams")]
    pub input_params: Vec<VariableTypeAndName>,
    #[serde(rename = "outputType")]
    pub output_type: VariableType,
    #[serde(rename = "methodName")]
    pub method_name: String,
}
