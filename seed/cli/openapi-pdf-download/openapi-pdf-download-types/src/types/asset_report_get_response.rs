pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct AssetReportGetResponse {
    #[serde(default)]
    pub request_id: String,
}

impl AssetReportGetResponse {
    pub fn builder() -> AssetReportGetResponseBuilder {
        <AssetReportGetResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AssetReportGetResponseBuilder {
    request_id: Option<String>,
}

impl AssetReportGetResponseBuilder {
    pub fn request_id(mut self, value: impl Into<String>) -> Self {
        self.request_id = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AssetReportGetResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`request_id`](AssetReportGetResponseBuilder::request_id)
    pub fn build(self) -> Result<AssetReportGetResponse, BuildError> {
        Ok(AssetReportGetResponse {
            request_id: self.request_id.ok_or_else(|| BuildError::missing_field("request_id"))?,
        })
    }
}
