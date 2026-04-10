pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3GetFunctionSignatureRequest {
    #[serde(rename = "functionSignature")]
    pub function_signature: V2V3FunctionSignature,
}

impl V2V3GetFunctionSignatureRequest {
    pub fn builder() -> V2V3GetFunctionSignatureRequestBuilder {
        <V2V3GetFunctionSignatureRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3GetFunctionSignatureRequestBuilder {
    function_signature: Option<V2V3FunctionSignature>,
}

impl V2V3GetFunctionSignatureRequestBuilder {
    pub fn function_signature(mut self, value: V2V3FunctionSignature) -> Self {
        self.function_signature = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3GetFunctionSignatureRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`function_signature`](V2V3GetFunctionSignatureRequestBuilder::function_signature)
    pub fn build(self) -> Result<V2V3GetFunctionSignatureRequest, BuildError> {
        Ok(V2V3GetFunctionSignatureRequest {
            function_signature: self
                .function_signature
                .ok_or_else(|| BuildError::missing_field("function_signature"))?,
        })
    }
}
