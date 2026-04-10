pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2GetBasicSolutionFileRequest {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    pub signature: V2NonVoidFunctionSignature,
}

impl V2GetBasicSolutionFileRequest {
    pub fn builder() -> V2GetBasicSolutionFileRequestBuilder {
        <V2GetBasicSolutionFileRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2GetBasicSolutionFileRequestBuilder {
    method_name: Option<String>,
    signature: Option<V2NonVoidFunctionSignature>,
}

impl V2GetBasicSolutionFileRequestBuilder {
    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    pub fn signature(mut self, value: V2NonVoidFunctionSignature) -> Self {
        self.signature = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2GetBasicSolutionFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`method_name`](V2GetBasicSolutionFileRequestBuilder::method_name)
    /// - [`signature`](V2GetBasicSolutionFileRequestBuilder::signature)
    pub fn build(self) -> Result<V2GetBasicSolutionFileRequest, BuildError> {
        Ok(V2GetBasicSolutionFileRequest {
            method_name: self
                .method_name
                .ok_or_else(|| BuildError::missing_field("method_name"))?,
            signature: self
                .signature
                .ok_or_else(|| BuildError::missing_field("signature"))?,
        })
    }
}
