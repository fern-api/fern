pub use crate::prelude::*;

/// Request type for API operation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetDefaultStarterFilesRequest {
    #[serde(rename = "inputParams")]
    pub input_params: Vec<VariableTypeAndName>,
    #[serde(rename = "outputType")]
    pub output_type: VariableType,
    /// The name of the `method` that the student has to complete.
    /// The method name cannot include the following characters:
    /// - Greater Than `>`
    /// - Less Than `<``
    /// - Equals `=`
    /// - Period `.`
    #[serde(rename = "methodName")]
    pub method_name: String,
}
