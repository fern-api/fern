pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct DetailedOrgMetadata {
    /// Deployment region from DetailedOrg.
    #[serde(default)]
    pub region: String,
    /// Custom domain name.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub domain: Option<String>,
}

impl DetailedOrgMetadata {
    pub fn builder() -> DetailedOrgMetadataBuilder {
        <DetailedOrgMetadataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct DetailedOrgMetadataBuilder {
    region: Option<String>,
    domain: Option<String>,
}

impl DetailedOrgMetadataBuilder {
    pub fn region(mut self, value: impl Into<String>) -> Self {
        self.region = Some(value.into());
        self
    }

    pub fn domain(mut self, value: impl Into<String>) -> Self {
        self.domain = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`DetailedOrgMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`region`](DetailedOrgMetadataBuilder::region)
    pub fn build(self) -> Result<DetailedOrgMetadata, BuildError> {
        Ok(DetailedOrgMetadata {
            region: self.region.ok_or_else(|| BuildError::missing_field("region"))?,
            domain: self.domain,
        })
    }
}
