pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetFunctionSignatureRequest2 {
    #[serde(rename = "functionSignature")]
    pub function_signature: FunctionSignature2,
}

impl GetFunctionSignatureRequest2 {
    pub fn builder() -> GetFunctionSignatureRequest2Builder {
        GetFunctionSignatureRequest2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetFunctionSignatureRequest2Builder {
    function_signature: Option<FunctionSignature2>,
}

impl GetFunctionSignatureRequest2Builder {
    pub fn function_signature(mut self, value: FunctionSignature2) -> Self {
        self.function_signature = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetFunctionSignatureRequest2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`function_signature`](GetFunctionSignatureRequest2Builder::function_signature)
    pub fn build(self) -> Result<GetFunctionSignatureRequest2, BuildError> {
        Ok(GetFunctionSignatureRequest2 {
            function_signature: self.function_signature.ok_or_else(|| BuildError::missing_field("function_signature"))?,
        })
    }
}
