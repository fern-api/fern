pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetDefaultStarterFilesRequest {
    #[serde(rename = "inputParams")]
    #[serde(default)]
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
    #[serde(default)]
    pub method_name: String,
}

impl GetDefaultStarterFilesRequest {
    pub fn builder() -> GetDefaultStarterFilesRequestBuilder {
        <GetDefaultStarterFilesRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetDefaultStarterFilesRequestBuilder {
    input_params: Option<Vec<VariableTypeAndName>>,
    output_type: Option<VariableType>,
    method_name: Option<String>,
}

impl GetDefaultStarterFilesRequestBuilder {
    pub fn input_params(mut self, value: Vec<VariableTypeAndName>) -> Self {
        self.input_params = Some(value);
        self
    }

    pub fn output_type(mut self, value: VariableType) -> Self {
        self.output_type = Some(value);
        self
    }

    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetDefaultStarterFilesRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`input_params`](GetDefaultStarterFilesRequestBuilder::input_params)
    /// - [`output_type`](GetDefaultStarterFilesRequestBuilder::output_type)
    /// - [`method_name`](GetDefaultStarterFilesRequestBuilder::method_name)
    pub fn build(self) -> Result<GetDefaultStarterFilesRequest, BuildError> {
        Ok(GetDefaultStarterFilesRequest {
            input_params: self.input_params.ok_or_else(|| BuildError::missing_field("input_params"))?,
            output_type: self.output_type.ok_or_else(|| BuildError::missing_field("output_type"))?,
            method_name: self.method_name.ok_or_else(|| BuildError::missing_field("method_name"))?,
        })
    }
}

