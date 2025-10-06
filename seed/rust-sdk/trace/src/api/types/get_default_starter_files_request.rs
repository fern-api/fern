pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetDefaultStarterFilesRequest {
    #[serde(rename = "inputParams")]
    pub input_params: Vec<ProblemVariableTypeAndName>,
    #[serde(rename = "outputType")]
    pub output_type: CommonsVariableType,
    #[serde(rename = "methodName")]
    pub method_name: String,
}
