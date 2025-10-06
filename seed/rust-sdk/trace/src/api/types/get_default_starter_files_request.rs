pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetDefaultStarterFilesRequest {
    #[serde(rename = "inputParams")]
    pub input_params: Vec<VariableTypeAndName>,
    #[serde(rename = "outputType")]
    pub output_type: VariableType,
    #[serde(rename = "methodName")]
    pub method_name: String,
}
