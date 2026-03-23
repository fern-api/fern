pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GetBasicSolutionFileRequest2 {
    #[serde(rename = "methodName")]
    #[serde(default)]
    pub method_name: String,
    pub signature: NonVoidFunctionSignature2,
}

impl GetBasicSolutionFileRequest2 {
    pub fn builder() -> GetBasicSolutionFileRequest2Builder {
        GetBasicSolutionFileRequest2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetBasicSolutionFileRequest2Builder {
    method_name: Option<String>,
    signature: Option<NonVoidFunctionSignature2>,
}

impl GetBasicSolutionFileRequest2Builder {
    pub fn method_name(mut self, value: impl Into<String>) -> Self {
        self.method_name = Some(value.into());
        self
    }

    pub fn signature(mut self, value: NonVoidFunctionSignature2) -> Self {
        self.signature = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetBasicSolutionFileRequest2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`method_name`](GetBasicSolutionFileRequest2Builder::method_name)
    /// - [`signature`](GetBasicSolutionFileRequest2Builder::signature)
    pub fn build(self) -> Result<GetBasicSolutionFileRequest2, BuildError> {
        Ok(GetBasicSolutionFileRequest2 {
            method_name: self
                .method_name
                .ok_or_else(|| BuildError::missing_field("method_name"))?,
            signature: self
                .signature
                .ok_or_else(|| BuildError::missing_field("signature"))?,
        })
    }
}
