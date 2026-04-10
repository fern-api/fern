pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3GetBasicSolutionFileRequest {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    pub signature: V2V3NonVoidFunctionSignature,
}

impl V2V3GetBasicSolutionFileRequest {
    pub fn builder() -> V2V3GetBasicSolutionFileRequestBuilder {
        <V2V3GetBasicSolutionFileRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3GetBasicSolutionFileRequestBuilder {
    method_name: Option<String>,
    signature: Option<V2V3NonVoidFunctionSignature>,
}

impl V2V3GetBasicSolutionFileRequestBuilder {
    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    pub fn signature(mut self, value: V2V3NonVoidFunctionSignature) -> Self {
        self.signature = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3GetBasicSolutionFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`method_name`](V2V3GetBasicSolutionFileRequestBuilder::method_name)
    /// - [`signature`](V2V3GetBasicSolutionFileRequestBuilder::signature)
    pub fn build(self) -> Result<V2V3GetBasicSolutionFileRequest, BuildError> {
        Ok(V2V3GetBasicSolutionFileRequest {
            method_name: self
                .method_name
                .ok_or_else(|| BuildError::missing_field("method_name"))?,
            signature: self
                .signature
                .ok_or_else(|| BuildError::missing_field("signature"))?,
        })
    }
}
