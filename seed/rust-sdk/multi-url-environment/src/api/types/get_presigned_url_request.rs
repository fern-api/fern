pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct GetPresignedUrlRequest {
    #[serde(rename = "s3Key")]
    #[serde(default)]
    pub s_3_key: String,
}

impl GetPresignedUrlRequest {
    pub fn builder() -> GetPresignedUrlRequestBuilder {
        <GetPresignedUrlRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetPresignedUrlRequestBuilder {
    s_3_key: Option<String>,
}

impl GetPresignedUrlRequestBuilder {
    pub fn s_3_key(mut self, value: impl Into<String>) -> Self {
        self.s_3_key = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`GetPresignedUrlRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`s_3_key`](GetPresignedUrlRequestBuilder::s_3_key)
    pub fn build(self) -> Result<GetPresignedUrlRequest, BuildError> {
        Ok(GetPresignedUrlRequest {
            s_3_key: self
                .s_3_key
                .ok_or_else(|| BuildError::missing_field("s_3_key"))?,
        })
    }
}
