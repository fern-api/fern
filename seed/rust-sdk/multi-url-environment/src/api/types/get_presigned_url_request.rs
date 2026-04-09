pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetPresignedUrlRequest {
    #[serde(rename = "s3Key")]
    #[serde(default)]
    pub s3key: String,
}

impl GetPresignedUrlRequest {
    pub fn builder() -> GetPresignedUrlRequestBuilder {
        <GetPresignedUrlRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetPresignedUrlRequestBuilder {
    s3key: Option<String>,
}

impl GetPresignedUrlRequestBuilder {
    pub fn s3key(mut self, value: impl Into<String>) -> Self {
        self.s3key = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetPresignedUrlRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`s3key`](GetPresignedUrlRequestBuilder::s3key)
    pub fn build(self) -> Result<GetPresignedUrlRequest, BuildError> {
        Ok(GetPresignedUrlRequest {
            s3key: self
                .s3key
                .ok_or_else(|| BuildError::missing_field("s3key"))?,
        })
    }
}
