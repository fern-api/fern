pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2GetFunctionSignatureRequest {
    #[serde(rename = "functionSignature")]
    pub function_signature: V2FunctionSignature,
}

impl V2GetFunctionSignatureRequest {
    pub fn builder() -> V2GetFunctionSignatureRequestBuilder {
        <V2GetFunctionSignatureRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2GetFunctionSignatureRequestBuilder {
    function_signature: Option<V2FunctionSignature>,
}

impl V2GetFunctionSignatureRequestBuilder {
    pub fn function_signature(mut self, value: V2FunctionSignature) -> Self {
        self.function_signature = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2GetFunctionSignatureRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`function_signature`](V2GetFunctionSignatureRequestBuilder::function_signature)
    pub fn build(self) -> Result<V2GetFunctionSignatureRequest, BuildError> {
        Ok(V2GetFunctionSignatureRequest {
            function_signature: self.function_signature.ok_or_else(|| BuildError::missing_field("function_signature"))?,
        })
    }
}
