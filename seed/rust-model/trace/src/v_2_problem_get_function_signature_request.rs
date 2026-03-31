pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetFunctionSignatureRequest {
    #[serde(rename = "functionSignature")]
    pub function_signature: FunctionSignature,
}

impl GetFunctionSignatureRequest {
    pub fn builder() -> GetFunctionSignatureRequestBuilder {
        <GetFunctionSignatureRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetFunctionSignatureRequestBuilder {
    function_signature: Option<FunctionSignature>,
}

impl GetFunctionSignatureRequestBuilder {
    pub fn function_signature(mut self, value: FunctionSignature) -> Self {
        self.function_signature = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetFunctionSignatureRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`function_signature`](GetFunctionSignatureRequestBuilder::function_signature)
    pub fn build(self) -> Result<GetFunctionSignatureRequest, BuildError> {
        Ok(GetFunctionSignatureRequest {
            function_signature: self.function_signature.ok_or_else(|| BuildError::missing_field("function_signature"))?,
        })
    }
}
