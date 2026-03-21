pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetBasicSolutionFileRequest {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    pub signature: NonVoidFunctionSignature,
}

impl GetBasicSolutionFileRequest {
    pub fn builder() -> GetBasicSolutionFileRequestBuilder {
        GetBasicSolutionFileRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetBasicSolutionFileRequestBuilder {
    method_name: Option<String>,
    signature: Option<NonVoidFunctionSignature>,
}

impl GetBasicSolutionFileRequestBuilder {
    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    pub fn signature(mut self, value: NonVoidFunctionSignature) -> Self {
        self.signature = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetBasicSolutionFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`method_name`](GetBasicSolutionFileRequestBuilder::method_name)
    /// - [`signature`](GetBasicSolutionFileRequestBuilder::signature)
    pub fn build(self) -> Result<GetBasicSolutionFileRequest, BuildError> {
        Ok(GetBasicSolutionFileRequest {
            method_name: self.method_name.ok_or_else(|| BuildError::missing_field("method_name"))?,
            signature: self.signature.ok_or_else(|| BuildError::missing_field("signature"))?,
        })
    }
}
