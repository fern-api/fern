pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct AssetReportPdfGetRequest {
    #[serde(default)]
    pub asset_report_token: String,
}

impl AssetReportPdfGetRequest {
    pub fn builder() -> AssetReportPdfGetRequestBuilder {
        <AssetReportPdfGetRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct AssetReportPdfGetRequestBuilder {
    asset_report_token: Option<String>,
}

impl AssetReportPdfGetRequestBuilder {
    pub fn asset_report_token(mut self, value: impl Into<String>) -> Self {
        self.asset_report_token = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`AssetReportPdfGetRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`asset_report_token`](AssetReportPdfGetRequestBuilder::asset_report_token)
    pub fn build(self) -> Result<AssetReportPdfGetRequest, BuildError> {
        Ok(AssetReportPdfGetRequest {
            asset_report_token: self.asset_report_token.ok_or_else(|| BuildError::missing_field("asset_report_token"))?,
        })
    }
}
